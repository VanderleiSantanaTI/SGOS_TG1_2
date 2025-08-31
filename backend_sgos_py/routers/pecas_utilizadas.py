from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models import PecaUtilizada, OrdemServico, Usuario
from schemas import PecaUtilizada as PecaUtilizadaSchema, PecaUtilizadaCreate, PecaUtilizadaUpdate
from auth import get_current_active_user
from utils.response_utils import (
    create_paginated_response, create_single_item_response, create_create_response,
    create_update_response, create_delete_response, create_not_found_response,
    create_validation_error_response, create_list_response, create_error_response
)

router = APIRouter(prefix="/pecas-utilizadas", tags=["Peças Utilizadas"])

@router.get("/")
async def listar_pecas_utilizadas(
    skip: int = Query(0, ge=0, description="Número de registros para pular"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros"),
    search: Optional[str] = Query(None, description="Termo de busca na peça"),
    os_id: Optional[int] = Query(None, description="Filtrar por ID da ordem de serviço"),
    usuario_id: Optional[int] = Query(None, description="Filtrar por usuário"),
    num_ficha: Optional[str] = Query(None, description="Filtrar por número da ficha"),
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista peças utilizadas com paginação e filtros"""
    try:
        query = db.query(PecaUtilizada)
        
        if search:
            query = query.filter(PecaUtilizada.peca_utilizada.contains(search))
        
        if os_id:
            query = query.filter(PecaUtilizada.abrir_os_id == os_id)
        
        if usuario_id:
            query = query.filter(PecaUtilizada.usuario_id == usuario_id)
        
        if num_ficha:
            query = query.filter(PecaUtilizada.num_ficha.contains(num_ficha))
        
        total = query.count()
        pecas = query.offset(skip).limit(limit).all()
        
        items = []
        for peca in pecas:
            items.append({
                "id": peca.id,
                "peca_utilizada": peca.peca_utilizada,
                "num_ficha": peca.num_ficha,
                "qtd": peca.qtd,
                "abrir_os_id": peca.abrir_os_id,
                "usuario_id": peca.usuario_id,
                "created_at": peca.created_at,
                "usuario": {
                    "id": peca.usuario.id,
                    "username": peca.usuario.username,
                    "nome_completo": peca.usuario.nome_completo
                } if peca.usuario else None
            })
        
        pages = (total + limit - 1) // limit
        
        return create_paginated_response(
            items=items,
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages,
            message="Peças utilizadas listadas com sucesso"
        )
        
    except Exception as e:
        return create_error_response(f"Erro ao listar peças utilizadas: {str(e)}")

@router.get("/{peca_id}")
async def obter_peca_utilizada(
    peca_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém uma peça utilizada específica"""
    try:
        peca = db.query(PecaUtilizada).filter(PecaUtilizada.id == peca_id).first()
        if not peca:
            return create_not_found_response("Peça utilizada")
        
        peca_data = {
            "id": peca.id,
            "peca_utilizada": peca.peca_utilizada,
            "num_ficha": peca.num_ficha,
            "qtd": peca.qtd,
            "abrir_os_id": peca.abrir_os_id,
            "usuario_id": peca.usuario_id,
            "created_at": peca.created_at,
            "usuario": {
                "id": peca.usuario.id,
                "username": peca.usuario.username,
                "nome_completo": peca.usuario.nome_completo
            } if peca.usuario else None
        }
        
        return create_single_item_response(peca_data, "Peça utilizada encontrada com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao buscar peça utilizada: {str(e)}")

@router.post("/")
async def criar_peca_utilizada(
    peca_data: PecaUtilizadaCreate,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cria uma nova peça utilizada"""
    try:
        # Verificar se a ordem de serviço existe
        ordem_servico = db.query(OrdemServico).filter(OrdemServico.id == peca_data.abrir_os_id).first()
        if not ordem_servico:
            return create_validation_error_response(
                ["Ordem de serviço não encontrada"],
                "Ordem de serviço inválida"
            )
        
        # Verificar se a OS está em andamento ou aberta
        if ordem_servico.situacao_os not in ["ABERTA", "EM_ANDAMENTO"]:
            return create_validation_error_response(
                ["Só é possível adicionar peças em OS aberta ou em andamento"],
                "Status da OS não permite adição de peças"
            )
        
        db_peca = PecaUtilizada(
            peca_utilizada=peca_data.peca_utilizada,
            num_ficha=peca_data.num_ficha,
            qtd=peca_data.qtd,
            abrir_os_id=peca_data.abrir_os_id,
            usuario_id=current_user.id
        )
        
        db.add(db_peca)
        db.commit()
        db.refresh(db_peca)
        
        peca_data_response = {
            "id": db_peca.id,
            "peca_utilizada": db_peca.peca_utilizada,
            "num_ficha": db_peca.num_ficha,
            "qtd": db_peca.qtd,
            "abrir_os_id": db_peca.abrir_os_id,
            "usuario_id": db_peca.usuario_id,
            "created_at": db_peca.created_at
        }
        
        return create_create_response(peca_data_response, "Peça utilizada criada com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao criar peça utilizada: {str(e)}")

@router.put("/{peca_id}")
async def atualizar_peca_utilizada(
    peca_id: int,
    peca_data: PecaUtilizadaUpdate,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualiza uma peça utilizada"""
    try:
        peca = db.query(PecaUtilizada).filter(PecaUtilizada.id == peca_id).first()
        if not peca:
            return create_not_found_response("Peça utilizada")
        
        # Verificar se a ordem de serviço existe (se foi alterada)
        if peca_data.abrir_os_id and peca_data.abrir_os_id != peca.abrir_os_id:
            ordem_servico = db.query(OrdemServico).filter(OrdemServico.id == peca_data.abrir_os_id).first()
            if not ordem_servico:
                return create_validation_error_response(
                    ["Ordem de serviço não encontrada"],
                    "Ordem de serviço inválida"
                )
            
            # Verificar se a nova OS está em andamento ou aberta
            if ordem_servico.situacao_os not in ["ABERTA", "EM_ANDAMENTO"]:
                return create_validation_error_response(
                    ["Só é possível adicionar peças em OS aberta ou em andamento"],
                    "Status da OS não permite adição de peças"
                )
        
        # Atualizar campos
        update_data = peca_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(peca, field, value)
        
        db.commit()
        db.refresh(peca)
        
        peca_data_response = {
            "id": peca.id,
            "peca_utilizada": peca.peca_utilizada,
            "num_ficha": peca.num_ficha,
            "qtd": peca.qtd,
            "abrir_os_id": peca.abrir_os_id,
            "usuario_id": peca.usuario_id,
            "created_at": peca.created_at
        }
        
        return create_update_response(peca_data_response, "Peça utilizada atualizada com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao atualizar peça utilizada: {str(e)}")

@router.delete("/{peca_id}")
async def deletar_peca_utilizada(
    peca_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deleta uma peça utilizada"""
    try:
        peca = db.query(PecaUtilizada).filter(PecaUtilizada.id == peca_id).first()
        if not peca:
            return create_not_found_response("Peça utilizada")
        
        db.delete(peca)
        db.commit()
        
        return create_delete_response("Peça utilizada deletada com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao deletar peça utilizada: {str(e)}")

@router.get("/os/{os_id}/pecas")
async def listar_pecas_por_os(
    os_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista todas as peças utilizadas de uma ordem de serviço específica"""
    try:
        # Verificar se a OS existe
        ordem_servico = db.query(OrdemServico).filter(OrdemServico.id == os_id).first()
        if not ordem_servico:
            return create_not_found_response("Ordem de serviço")
        
        pecas = db.query(PecaUtilizada).filter(PecaUtilizada.abrir_os_id == os_id).all()
        
        items = []
        for peca in pecas:
            items.append({
                "id": peca.id,
                "peca_utilizada": peca.peca_utilizada,
                "num_ficha": peca.num_ficha,
                "qtd": peca.qtd,
                "abrir_os_id": peca.abrir_os_id,
                "usuario_id": peca.usuario_id,
                "created_at": peca.created_at,
                "usuario": {
                    "id": peca.usuario.id,
                    "username": peca.usuario.username,
                    "nome_completo": peca.usuario.nome_completo
                } if peca.usuario else None
            })
        
        return create_list_response(items, f"Peças da OS {os_id} listadas com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao listar peças da OS: {str(e)}")

@router.get("/fichas/lista")
async def listar_fichas(
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista todas as fichas disponíveis"""
    try:
        fichas = db.query(PecaUtilizada.num_ficha).distinct().all()
        fichas_list = [ficha[0] for ficha in fichas if ficha[0]]
        
        return create_list_response(fichas_list, "Fichas listadas com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao listar fichas: {str(e)}")

@router.get("/pecas/lista")
async def listar_pecas(
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista todas as peças disponíveis"""
    try:
        pecas = db.query(PecaUtilizada.peca_utilizada).distinct().all()
        pecas_list = [peca[0] for peca in pecas if peca[0]]
        
        return create_list_response(pecas_list, "Peças listadas com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao listar peças: {str(e)}")
