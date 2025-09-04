from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import OrdemServico, Veiculo, Usuario, EncerrarOS, RetiradaViatura
from schemas import OrdemServico as OrdemServicoSchema, OrdemServicoCreate, OrdemServicoUpdate, MessageResponse, PaginatedResponse
from auth import get_current_active_user

router = APIRouter(prefix="/ordens-servico", tags=["Ordens de Serviço"])

@router.get("/")
async def listar_ordens_servico(
    skip: int = Query(0, ge=0, description="Número de registros para pular"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros"),
    search: Optional[str] = Query(None, description="Termo de busca"),
    situacao: Optional[str] = Query(None, description="Filtrar por situação"),
    manutencao: Optional[str] = Query(None, description="Filtrar por tipo de manutenção"),
    veiculo_id: Optional[int] = Query(None, description="Filtrar por veículo"),
    data_inicio: Optional[str] = Query(None, description="Data de início (DD/MM/YYYY)"),
    data_fim: Optional[str] = Query(None, description="Data de fim (DD/MM/YYYY)"),
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista ordens de serviço com paginação e filtros"""
    query = db.query(OrdemServico).options(
        joinedload(OrdemServico.veiculo),
        joinedload(OrdemServico.usuario)
    )
    
    if search:
        query = query.filter(
            (OrdemServico.problema_apresentado.contains(search)) |
            (OrdemServico.sistema_afetado.contains(search)) |
            (OrdemServico.causa_da_avaria.contains(search)) |
            (OrdemServico.hodometro.contains(search))
        )
    
    if situacao:
        query = query.filter(OrdemServico.situacao_os == situacao)
    
    if manutencao:
        query = query.filter(OrdemServico.manutencao == manutencao)
    
    if veiculo_id:
        query = query.filter(OrdemServico.veiculo_id == veiculo_id)
    
    if data_inicio:
        # Converter data DD/MM/YYYY para comparação
        try:
            dia, mes, ano = data_inicio.split('/')
            data_inicio_convertida = f"{ano}-{mes}-{dia}"
            query = query.filter(OrdemServico.data >= data_inicio_convertida)
        except:
            pass
    
    if data_fim:
        # Converter data DD/MM/YYYY para comparação
        try:
            dia, mes, ano = data_fim.split('/')
            data_fim_convertida = f"{ano}-{mes}-{dia}"
            query = query.filter(OrdemServico.data <= data_fim_convertida)
        except:
            pass
    
    total = query.count()
    ordens = query.offset(skip).limit(limit).all()
    
    items = []
    for ordem in ordens:
        items.append({
            "id": ordem.id,
            "data": ordem.data,
            "veiculo_id": ordem.veiculo_id,
            "veiculo": {
                "id": ordem.veiculo.id,
                "marca": ordem.veiculo.marca,
                "modelo": ordem.veiculo.modelo,
                "placa": ordem.veiculo.placa,
                "patrimonio": ordem.veiculo.patrimonio,
                "su_cia_viatura": ordem.veiculo.su_cia_viatura
            } if ordem.veiculo else None,
            "hodometro": ordem.hodometro,
            "problema_apresentado": ordem.problema_apresentado,
            "sistema_afetado": ordem.sistema_afetado,
            "causa_da_avaria": ordem.causa_da_avaria,
            "manutencao": ordem.manutencao,
            "usuario_id": ordem.usuario_id,
            "usuario": {
                "id": ordem.usuario.id,
                "username": ordem.usuario.username,
                "nome_completo": ordem.usuario.nome_completo
            } if ordem.usuario else None,
            "perfil": ordem.perfil,
            "situacao_os": ordem.situacao_os,
            "created_at": ordem.created_at,
            "updated_at": ordem.updated_at
        })
    
    pages = (total + limit - 1) // limit
    
    from utils.response_utils import create_paginated_response
    
    return create_paginated_response(
        items=items,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=pages,
        message="Dados recuperados com sucesso"
    )

@router.get("/{ordem_id}")
async def obter_ordem_servico(
    ordem_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém uma ordem de serviço específica"""
    ordem = db.query(OrdemServico).options(
        joinedload(OrdemServico.veiculo),
        joinedload(OrdemServico.usuario)
    ).filter(OrdemServico.id == ordem_id).first()
    
    if not ordem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ordem de serviço não encontrada"
        )
    
    # Buscar informações de encerramento
    encerramento = db.query(EncerrarOS).filter(EncerrarOS.abrir_os_id == ordem_id).first()
    
    # Buscar informações de retirada se existir encerramento
    retirada_viatura = None
    if encerramento:
        retirada_viatura = db.query(RetiradaViatura).options(
            joinedload(RetiradaViatura.usuario)
        ).filter(RetiradaViatura.encerrar_os_id == encerramento.id).first()
    
    # Montar resposta com informações adicionais
    ordem_data = {
        "id": ordem.id,
        "data": ordem.data,
        "veiculo_id": ordem.veiculo_id,
        "hodometro": ordem.hodometro,
        "problema_apresentado": ordem.problema_apresentado,
        "sistema_afetado": ordem.sistema_afetado,
        "causa_da_avaria": ordem.causa_da_avaria,
        "manutencao": ordem.manutencao,
        "situacao_os": ordem.situacao_os,
        "usuario_id": ordem.usuario_id,
        "perfil": ordem.perfil,
        "created_at": ordem.created_at,
        "veiculo": {
            "id": ordem.veiculo.id,
            "marca": ordem.veiculo.marca,
            "modelo": ordem.veiculo.modelo,
            "placa": ordem.veiculo.placa,
            "patrimonio": ordem.veiculo.patrimonio
        } if ordem.veiculo else None,
        "usuario": {
            "id": ordem.usuario.id,
            "nome": ordem.usuario.nome_completo,
            "username": ordem.usuario.username,
            "perfil": ordem.usuario.perfil
        } if ordem.usuario else None,
        "encerrar_os": {
            "id": encerramento.id,
            "nome_mecanico": encerramento.nome_mecanico,
            "data_da_manutencao": encerramento.data_da_manutencao,
            "situacao": encerramento.situacao_os,
            "tempo_total": encerramento.tempo_total,
            "usuario_id": encerramento.usuario_id,
            "abrir_os_id": encerramento.abrir_os_id,
            "modelo_veiculo": encerramento.modelo_veiculo,
            "created_at": encerramento.created_at
        } if encerramento else None,
        "retirada_viatura": {
            "id": retirada_viatura.id,
            "nome": retirada_viatura.nome,
            "data": retirada_viatura.data,
            "encerrar_os_id": retirada_viatura.encerrar_os_id,
            "usuario_id": retirada_viatura.usuario_id,
            "created_at": retirada_viatura.created_at,
            "usuario": {
                "id": retirada_viatura.usuario.id,
                "username": retirada_viatura.usuario.username,
                "nome_completo": retirada_viatura.usuario.nome_completo
            } if retirada_viatura.usuario else None
        } if retirada_viatura else None
    }
    
    from utils.response_utils import create_success_response
    
    return create_success_response(
        data=ordem_data,
        message="Ordem de serviço encontrada com sucesso"
    )

@router.post("/")
async def criar_ordem_servico(
    ordem_data: OrdemServicoCreate,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cria uma nova ordem de serviço"""
    # Verificar se o veículo existe
    veiculo = db.query(Veiculo).filter(Veiculo.id == ordem_data.veiculo_id).first()
    if not veiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Veículo não encontrado"
        )
    
    # Verificar se o veículo está ativo
    if veiculo.status != "ATIVO":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Veículo não está ativo"
        )
    
    db_ordem = OrdemServico(
        **ordem_data.dict(),
        usuario_id=current_user.id
    )
    
    db.add(db_ordem)
    
    # Alterar status do veículo para MANUTENCAO
    veiculo.status = "MANUTENCAO"
    
    db.commit()
    db.refresh(db_ordem)
    
    # Retornar com dados do veículo e usuário
    ordem_completa = db.query(OrdemServico).options(
        joinedload(OrdemServico.veiculo),
        joinedload(OrdemServico.usuario)
    ).filter(OrdemServico.id == db_ordem.id).first()
    
    from utils.response_utils import create_success_response
    
    return create_success_response(
        data=ordem_completa,
        message="Ordem de serviço criada com sucesso"
    )

@router.put("/{ordem_id}")
async def atualizar_ordem_servico(
    ordem_id: int,
    ordem_data: OrdemServicoUpdate,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualiza uma ordem de serviço"""
    ordem = db.query(OrdemServico).filter(OrdemServico.id == ordem_id).first()
    if not ordem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ordem de serviço não encontrada"
        )
    
    # Verificar se o veículo existe (se foi alterado)
    if ordem_data.veiculo_id and ordem_data.veiculo_id != ordem.veiculo_id:
        veiculo = db.query(Veiculo).filter(Veiculo.id == ordem_data.veiculo_id).first()
        if not veiculo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Veículo não encontrado"
            )
        
        if veiculo.status != "ATIVO":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Veículo não está ativo"
            )
    
    # Atualizar campos
    update_data = ordem_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ordem, field, value)
    
    db.commit()
    db.refresh(ordem)
    
    # Retornar com dados do veículo e usuário
    ordem_atualizada = db.query(OrdemServico).options(
        joinedload(OrdemServico.veiculo),
        joinedload(OrdemServico.usuario)
    ).filter(OrdemServico.id == ordem.id).first()
    
    from utils.response_utils import create_success_response
    
    return create_success_response(
        data=ordem_atualizada,
        message="Ordem de serviço atualizada com sucesso"
    )

@router.delete("/{ordem_id}")
async def deletar_ordem_servico(
    ordem_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deleta uma ordem de serviço"""
    ordem = db.query(OrdemServico).filter(OrdemServico.id == ordem_id).first()
    if not ordem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ordem de serviço não encontrada"
        )
    
    # Verificar se a ordem pode ser deletada (não pode ter serviços ou peças associados)
    from models import ServicoRealizado, PecaUtilizada, EncerrarOS
    
    servicos_count = db.query(ServicoRealizado).filter(ServicoRealizado.abrir_os_id == ordem_id).count()
    pecas_count = db.query(PecaUtilizada).filter(PecaUtilizada.abrir_os_id == ordem_id).count()
    encerramentos_count = db.query(EncerrarOS).filter(EncerrarOS.abrir_os_id == ordem_id).count()
    
    if servicos_count > 0 or pecas_count > 0 or encerramentos_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível deletar uma ordem de serviço que possui serviços, peças ou encerramentos associados"
        )
    
    db.delete(ordem)
    db.commit()
    
    from utils.response_utils import create_success_response
    
    return create_success_response(
        data=None,
        message="Ordem de serviço deletada com sucesso"
    )

@router.get("/situacoes/lista")
async def listar_situacoes(
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista todas as situações disponíveis"""
    situacoes = db.query(OrdemServico.situacao_os).distinct().all()
    from utils.response_utils import create_success_response
    
    return create_success_response(
        data=[situacao[0] for situacao in situacoes if situacao[0]],
        message="Situações listadas com sucesso"
    )

@router.get("/manutencoes/lista")
async def listar_tipos_manutencao(
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista todos os tipos de manutenção disponíveis"""
    manutencoes = db.query(OrdemServico.manutencao).distinct().all()
    from utils.response_utils import create_success_response
    
    return create_success_response(
        data=[manutencao[0] for manutencao in manutencoes if manutencao[0]],
        message="Tipos de manutenção listados com sucesso"
    )

@router.get("/sistemas/lista")
async def listar_sistemas(
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista todos os sistemas disponíveis"""
    sistemas = db.query(OrdemServico.sistema_afetado).distinct().all()
    from utils.response_utils import create_success_response
    
    return create_success_response(
        data=[sistema[0] for sistema in sistemas if sistema[0]],
        message="Sistemas listados com sucesso"
    )
