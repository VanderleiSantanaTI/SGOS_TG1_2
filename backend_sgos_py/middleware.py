"""
Middleware para logging automático de todas as requisições da API e erros
Versão que NÃO interfere com o body da requisição
"""

import time
import traceback
import json
from typing import Callable
from fastapi import Request, Response
from sqlalchemy.orm import Session
from database import SessionLocal
from models import LogAPI, LogErro

async def log_api_middleware(request: Request, call_next: Callable) -> Response:
    
    """
    Middleware para capturar e logar todas as requisições da API e erros
    SEM interferir com o body da requisição
    """
    start_time = time.time()
    
    # Capturar informações da requisição (sem tocar no body)
    endpoint = str(request.url.path)
    metodo = request.method
    ip_address = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "")
    # Capturar dados da requisição (sem tocar no body)
    request_data = None
    try:
        # Capturar headers importantes (como no curl)
        important_headers = {}
        for header_name in ['accept', 'content-type', 'authorization', 'user-agent']:
            header_value = request.headers.get(header_name)
            if header_value:
                important_headers[header_name] = header_value
        
        # Capturar informações básicas da requisição sem consumir o body
        request_info = {
            # "url": str(request.url),
            # "method": request.method,
            "headers": important_headers,  # Apenas headers importantes
            "query_params": dict(request.query_params),
            "path_params": dict(request.path_params)
        }
        
        request_data = str(request_info)[:1000]  # Limitar a 1000 caracteres
    except Exception as e:
        request_data = f"Erro ao capturar dados da requisição: {str(e)}"
    
    # Executar a requisição
    try:
        response = await call_next(request)
        
        # Capturar o body da resposta usando body_iterator
        body = b""
        async for chunk in response.body_iterator:
            body += chunk
        
        response_body_text = body.decode() if body else f"Status: {response.status_code}"
        
        # Recriar o body_iterator para que a resposta possa ser enviada
        async def recreate_body_iterator():
            yield body
        
        response.body_iterator = recreate_body_iterator()
        
        # Calcular tempo de resposta
        process_time = int((time.time() - start_time) * 1000)  # Em milissegundos
        
        # Capturar dados da resposta
        response_data = None
        app_status = None  # Status da aplicação (success/error)
        
        try:
            # Extrair apenas a mensagem do response_data
            if response_body_text and response_body_text != f"Status: {response.status_code}":
                response_json = json.loads(response_body_text)
                if isinstance(response_json, dict):
                    # Capturar o status da aplicação
                    if 'status' in response_json:
                        app_status = response_json['status']
                    
                    # Procurar por campos de mensagem
                    if 'message' in response_json:
                        response_data = response_json['message']
                    elif 'detail' in response_json:
                        response_data = response_json['detail']
                    elif 'error' in response_json:
                        response_data = response_json['error']
                    elif 'status' in response_json:
                        response_data = f"Status: {response_json['status']}"
                    else:
                        response_data = response_body_text[:500]
                else:
                    response_data = response_body_text[:500]
            else:
                response_data = f"Status: {response.status_code} - Sem body disponível"
        except json.JSONDecodeError:
            response_data = response_body_text[:500] if response_body_text else f"Status: {response.status_code}"
        except Exception as e:
            response_data = f"Erro ao processar resposta: {str(e)}"
        
        # Salvar log da API no banco de dados
        await save_api_log(
            endpoint=endpoint,
            metodo=metodo,
            status_code=response.status_code,
            tempo_resposta=process_time,
            ip_address=ip_address,
            user_agent=user_agent,
            request_data=request_data,
            response_data=response_data,
            app_status=app_status,  # Status da aplicação (success/error)
            request=request
        )
        
        # Se o status code indica erro (4xx ou 5xx) OU se a resposta contém erro no JSON, também salvar no log de erro
        should_log_error = response.status_code >= 400
        
        # Verificar se a resposta contém erro mesmo com status 200
        if not should_log_error and response_body_text:
            try:
                response_json = json.loads(response_body_text)
                if isinstance(response_json, dict) and response_json.get('status') == 'error':
                    should_log_error = True
            except:
                pass
        
        if should_log_error:
            # Tentar extrair mensagem de erro da resposta
            error_message = f"HTTP {response.status_code}"
            
            # Mapear códigos de status comuns para mensagens mais descritivas
            status_messages = {
                400: "Bad Request - Requisição inválida",
                401: "Unauthorized - Não autenticado",
                403: "Forbidden - Acesso negado",
                404: "Not Found - Recurso não encontrado",
                405: "Method Not Allowed - Método não permitido",
                422: "Unprocessable Entity - Dados inválidos",
                500: "Internal Server Error - Erro interno do servidor"
            }
            
            try:
                if response_body_text:
                    # Tentar parsear como JSON para extrair mensagem de erro
                    try:
                        response_json = json.loads(response_body_text)
                        if isinstance(response_json, dict):
                            # Procurar por campos comuns de erro
                            if 'detail' in response_json:
                                error_message = f"HTTP {response.status_code}: {response_json['detail']}"
                            elif 'message' in response_json:
                                error_message = f"HTTP {response.status_code}: {response_json['message']}"
                            elif 'error' in response_json:
                                error_message = f"HTTP {response.status_code}: {response_json['error']}"
                            else:
                                # Se não encontrar campos específicos, usar a resposta completa
                                error_message = f"HTTP {response.status_code}: {response_body_text[:200]}"
                    except json.JSONDecodeError:
                        # Se não for JSON, usar o texto da resposta
                        error_message = f"HTTP {response.status_code}: {response_body_text[:200]}"
                else:
                    # Se não há body, usar mensagem padrão baseada no status code
                    error_message = status_messages.get(response.status_code, f"HTTP {response.status_code}")
            except Exception:
                # Se houver erro ao processar, usar mensagem padrão baseada no status code
                error_message = status_messages.get(response.status_code, f"HTTP {response.status_code}")
            
            await save_error_log(
                endpoint=endpoint,
                metodo=metodo,
                erro=error_message,
                stack_trace=f"Resposta: {response_body_text or 'N/A'}",
                ip_address=ip_address,
                request=request
            )
        
        return response
        
    except Exception as e:
        # Em caso de erro, calcular tempo e salvar logs
        process_time = int((time.time() - start_time) * 1000)
        
        # Capturar stack trace completo
        stack_trace = traceback.format_exc()
        
        # Salvar log da API com erro
        await save_api_log(
            endpoint=endpoint,
            metodo=metodo,
            status_code=500,  # Erro interno
            tempo_resposta=process_time,
            ip_address=ip_address,
            user_agent=user_agent,
            request_data=request_data,
            response_data=f"Erro: {str(e)}",
            request=request
        )
        
        # Salvar log de erro detalhado
        await save_error_log(
            endpoint=endpoint,
            metodo=metodo,
            erro=str(e),
            stack_trace=stack_trace,
            ip_address=ip_address,
            request=request
        )
        
        # Re-levantar a exceção
        raise

async def save_api_log(
    endpoint: str,
    metodo: str,
    status_code: int,
    tempo_resposta: int,
    ip_address: str,
    user_agent: str,
    request_data: str = None,
    response_data: str = None,
    app_status: str = None,
    request: Request = None
):
    """
    Salva o log da API no banco de dados
    """
    db = None
    try:
        # Criar nova sessão do banco
        db = SessionLocal()
        
        # Tentar obter usuário atual (se autenticado)
        usuario_id = None
        try:
            if request:
                # Verificar se há token de autorização
                auth_header = request.headers.get("authorization")
                if auth_header and auth_header.startswith("Bearer "):
                    token = auth_header.split(" ")[1]
                    # Aqui você pode implementar a verificação do token
                    # Por enquanto, vamos deixar como None
                    usuario_id = None
        except Exception:
            usuario_id = None
        # Normalizar tipos para strings curtas (evitar erro do SQLite com list/dict)
        try:
            if isinstance(request_data, (dict, list)):
                request_data = json.dumps(request_data)[:1000]
            elif request_data is not None and not isinstance(request_data, str):
                request_data = str(request_data)[:1000]
        except Exception:
            request_data = str(request_data)[:1000] if request_data is not None else None

        try:
            if isinstance(response_data, (dict, list)):
                response_data = json.dumps(response_data)[:1000]
            elif response_data is not None and not isinstance(response_data, str):
                response_data = str(response_data)[:1000]
        except Exception:
            response_data = str(response_data)[:1000] if response_data is not None else None

        # Criar log da API
        log_entry = LogAPI(
            endpoint=endpoint,
            metodo=metodo,
            status_code=status_code,
            app_status=app_status,  # Status da aplicação (success/error)
            tempo_resposta=tempo_resposta,
            usuario_id=usuario_id,
            ip_address=ip_address,
            user_agent=user_agent,
            request_data=request_data,
            response_data=response_data
        )

        db.add(log_entry)
        db.commit()
        
    except Exception as e:
        # Se houver erro ao salvar o log, apenas imprimir (não quebrar a aplicação)
        print(f"Erro ao salvar log da API: {e}")
    finally:
        if db:
            db.close()

async def save_error_log(
    endpoint: str,
    metodo: str,
    erro: str,
    stack_trace: str = None,
    ip_address: str = None,
    request: Request = None
):
    """
    Salva o log de erro no banco de dados
    """
    db = None
    try:
        # Criar nova sessão do banco
        db = SessionLocal()
        
        # Tentar obter usuário atual (se autenticado)
        usuario_id = None
        try:
            if request:
                # Verificar se há token de autorização
                auth_header = request.headers.get("authorization")
                if auth_header and auth_header.startswith("Bearer "):
                    token = auth_header.split(" ")[1]
                    # Aqui você pode implementar a verificação do token
                    # Por enquanto, vamos deixar como None
                    usuario_id = None
        except Exception:
            usuario_id = None
        
        # Criar log de erro
        log_entry = LogErro(
            endpoint=endpoint,
            metodo=metodo,
            erro=erro[:1000] if erro else "Erro desconhecido",  # Limitar a 1000 caracteres
            stack_trace=stack_trace[:5000] if stack_trace else None,  # Limitar a 5000 caracteres
            usuario_id=usuario_id,
            ip_address=ip_address or "unknown"
        )
        
        db.add(log_entry)
        db.commit()
        
    except Exception as e:
        # Se houver erro ao salvar o log, apenas imprimir (não quebrar a aplicação)
        print(f"Erro ao salvar log de erro: {e}")
    finally:
        if db:
            db.close()
