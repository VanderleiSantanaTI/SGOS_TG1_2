from datetime import datetime
from typing import Any, Optional, List
from schemas import SuccessResponse, ErrorResponse, WarningResponse, InfoResponse, MessageResponse, PaginatedResponse

def create_success_response(data: Any, message: str = "Operação realizada com sucesso") -> dict:
    """Cria uma resposta de sucesso padronizada"""
    return {
        "status": "success",
        "message": message,
        "timestamp": datetime.now().isoformat(),
        "data": data
    }

def create_error_response(message: str = "Erro na operação", data: Optional[Any] = None) -> dict:
    """Cria uma resposta de erro padronizada"""
    return {
        "status": "error",
        "message": message,
        "timestamp": datetime.now().isoformat(),
        "data": data
    }

def create_warning_response(
    message: str = "Aviso",
    data: Any = None
) -> dict:
    """Cria uma resposta de aviso padronizada"""
    return {
        "status": "warning",
        "message": message,
        "timestamp": datetime.now(),
        "data": data
    }

def create_info_response(
    message: str = "Informação",
    data: Any = None
) -> dict:
    """Cria uma resposta de informação padronizada"""
    return {
        "status": "info",
        "message": message,
        "timestamp": datetime.now(),
        "data": data
    }

def create_paginated_response(
    items: list, 
    total: int, 
    page: int, 
    size: int, 
    pages: int, 
    message: str = "Dados recuperados com sucesso"
) -> dict:
    """Cria uma resposta paginada padronizada"""
    return create_success_response(
        data={
            "items": items,
            "total": total,
            "page": page,
            "size": size,
            "pages": pages
        },
        message=message
    )

def create_single_item_response(
    item: Any,
    message: str = "Item recuperado com sucesso"
) -> dict:
    """Cria uma resposta para um item único"""
    return {
        "status": "success",
        "message": message,
        "timestamp": datetime.now(),
        "data": item
    }

def create_list_response(
    items: List[Any],
    message: str = "Lista recuperada com sucesso"
) -> dict:
    """Cria uma resposta para uma lista de itens"""
    return {
        "status": "success",
        "message": message,
        "timestamp": datetime.now(),
        "data": items
    }

def create_delete_response(
    message: str = "Item deletado com sucesso"
) -> dict:
    """Cria uma resposta para operação de deleção"""
    return {
        "status": "success",
        "message": message,
        "timestamp": datetime.now(),
        "data": None
    }

def create_create_response(
    item: Any,
    message: str = "Item criado com sucesso"
) -> dict:
    """Cria uma resposta para operação de criação"""
    return {
        "status": "success",
        "message": message,
        "timestamp": datetime.now(),
        "data": item
    }

def create_update_response(
    item: Any,
    message: str = "Item atualizado com sucesso"
) -> dict:
    """Cria uma resposta para operação de atualização"""
    return {
        "status": "success",
        "message": message,
        "timestamp": datetime.now(),
        "data": item
    }

def create_auth_response(
    token: str,
    user: dict,
    message: str = "Autenticação realizada com sucesso"
) -> dict:
    """Cria uma resposta para autenticação"""
    return {
        "status": "success",
        "message": message,
        "timestamp": datetime.now(),
        "data": {
            "access_token": token,
            "token_type": "bearer",
            "user": user
        }
    }

def create_validation_error_response(
    errors: List[str],
    message: str = "Erro de validação"
) -> dict:
    """Cria uma resposta para erro de validação"""
    return {
        "status": "error",
        "message": message,
        "timestamp": datetime.now(),
        "data": {
            "errors": errors
        }
    }

def create_not_found_response(
    item_name: str = "Item",
    message: Optional[str] = None
) -> dict:
    """Cria uma resposta para item não encontrado"""
    if message is None:
        message = f"{item_name} não encontrado"
    
    return {
        "status": "error",
        "message": message,
        "timestamp": datetime.now(),
        "data": None
    }

def create_unauthorized_response(
    message: str = "Acesso não autorizado"
) -> dict:
    """Cria uma resposta para acesso não autorizado"""
    return {
        "status": "error",
        "message": message,
        "timestamp": datetime.now(),
        "data": None
    }

def create_forbidden_response(
    message: str = "Acesso negado"
) -> dict:
    """Cria uma resposta para acesso negado"""
    return {
        "status": "error",
        "message": message,
        "timestamp": datetime.now(),
        "data": None
    }
