from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models import ServicoRealizado, OrdemServico, Usuario
from schemas import ServicoRealizado as ServicoRealizadoSchema, ServicoRealizadoCreate, ServicoRealizadoUpdate
from auth import get_current_active_user
from utils.response_utils import (
    create_paginated_response, create_single_item_response, create_create_response,
    create_update_response, create_delete_response, create_not_found_response,
    create_validation_error_response, create_list_response, create_error_response
)

router = APIRouter(prefix="/servicos-realizados", tags=["Serviços Realizados"])

@router.get("/")
async def listar_servicos_realizados(
    skip: int = Query(0, ge=0, description="Número de registros para pular"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros"),
    search: Optional[str] = Query(None, description="Termo de busca no serviço"),
    os_id: Optional[int] = Query(None, description="Filtrar por ID da ordem de serviço"),
    usuario_id: Optional[int] = Query(None, description="Filtrar por usuário"),
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista serviços realizados com paginação e filtros"""
    try:
        query = db.query(ServicoRealizado)
        
        if search:
            query = query.filter(ServicoRealizado.servico_realizado.contains(search))
        
        if os_id:
            query = query.filter(ServicoRealizado.abrir_os_id == os_id)
        
        if usuario_id:
            query = query.filter(ServicoRealizado.usuario_id == usuario_id)
        
        total = query.count()
        servicos = query.offset(skip).limit(limit).all()
        
        items = []
        for servico in servicos:
            items.append({
                "id": servico.id,
                "servico_realizado": servico.servico_realizado,
                "tempo_de_servico_realizado": servico.tempo_de_servico_realizado,
                "abrir_os_id": servico.abrir_os_id,
                "usuario_id": servico.usuario_id,
                "created_at": servico.created_at,
                "usuario": {
                    "id": servico.usuario.id,
                    "username": servico.usuario.username,
                    "nome_completo": servico.usuario.nome_completo
                } if servico.usuario else None
            })
        
        pages = (total + limit - 1) // limit
        
        return create_paginated_response(
            items=items,
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages,
            message="Serviços realizados listados com sucesso"
        )
        
    except Exception as e:
        return create_error_response(f"Erro ao listar serviços realizados: {str(e)}")

@router.get("/{servico_id}")
async def obter_servico_realizado(
    servico_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém um serviço realizado específico"""
    try:
        servico = db.query(ServicoRealizado).filter(ServicoRealizado.id == servico_id).first()
        if not servico:
            return create_not_found_response("Serviço realizado")
        
        servico_data = {
            "id": servico.id,
            "servico_realizado": servico.servico_realizado,
            "tempo_de_servico_realizado": servico.tempo_de_servico_realizado,
            "abrir_os_id": servico.abrir_os_id,
            "usuario_id": servico.usuario_id,
            "created_at": servico.created_at,
            "usuario": {
                "id": servico.usuario.id,
                "username": servico.usuario.username,
                "nome_completo": servico.usuario.nome_completo
            } if servico.usuario else None
        }
        
        return create_single_item_response(servico_data, "Serviço realizado encontrado com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao buscar serviço realizado: {str(e)}")

@router.post("/")
async def criar_servico_realizado(
    servico_data: ServicoRealizadoCreate,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cria um novo serviço realizado"""
    try:
        # Verificar se a ordem de serviço existe
        ordem_servico = db.query(OrdemServico).filter(OrdemServico.id == servico_data.abrir_os_id).first()
        if not ordem_servico:
            return create_validation_error_response(
                ["Ordem de serviço não encontrada"],
                "Ordem de serviço inválida"
            )
        
        # Verificar se a OS está em andamento ou aberta
        if ordem_servico.situacao_os not in ["ABERTA", "EM_ANDAMENTO"]:
            return create_validation_error_response(
                ["Só é possível adicionar serviços em OS aberta ou em andamento"],
                "Status da OS não permite adição de serviços"
            )
        
        db_servico = ServicoRealizado(
            servico_realizado=servico_data.servico_realizado,
            tempo_de_servico_realizado=servico_data.tempo_de_servico_realizado,
            abrir_os_id=servico_data.abrir_os_id,
            usuario_id=current_user.id
        )
        
        db.add(db_servico)
        db.commit()
        db.refresh(db_servico)
        
        servico_data_response = {
            "id": db_servico.id,
            "servico_realizado": db_servico.servico_realizado,
            "tempo_de_servico_realizado": db_servico.tempo_de_servico_realizado,
            "abrir_os_id": db_servico.abrir_os_id,
            "usuario_id": db_servico.usuario_id,
            "created_at": db_servico.created_at
        }
        
        return create_create_response(servico_data_response, "Serviço realizado criado com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao criar serviço realizado: {str(e)}")

@router.put("/{servico_id}")
async def atualizar_servico_realizado(
    servico_id: int,
    servico_data: ServicoRealizadoUpdate,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualiza um serviço realizado"""
    try:
        servico = db.query(ServicoRealizado).filter(ServicoRealizado.id == servico_id).first()
        if not servico:
            return create_not_found_response("Serviço realizado")
        
        # Verificar se a ordem de serviço existe (se foi alterada)
        if servico_data.abrir_os_id and servico_data.abrir_os_id != servico.abrir_os_id:
            ordem_servico = db.query(OrdemServico).filter(OrdemServico.id == servico_data.abrir_os_id).first()
            if not ordem_servico:
                return create_validation_error_response(
                    ["Ordem de serviço não encontrada"],
                    "Ordem de serviço inválida"
                )
            
            # Verificar se a nova OS está em andamento ou aberta
            if ordem_servico.situacao_os not in ["ABERTA", "EM_ANDAMENTO"]:
                return create_validation_error_response(
                    ["Só é possível adicionar serviços em OS aberta ou em andamento"],
                    "Status da OS não permite adição de serviços"
                )
        
        # Atualizar campos
        update_data = servico_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(servico, field, value)
        
        db.commit()
        db.refresh(servico)
        
        servico_data_response = {
            "id": servico.id,
            "servico_realizado": servico.servico_realizado,
            "tempo_de_servico_realizado": servico.tempo_de_servico_realizado,
            "abrir_os_id": servico.abrir_os_id,
            "usuario_id": servico.usuario_id,
            "created_at": servico.created_at
        }
        
        return create_update_response(servico_data_response, "Serviço realizado atualizado com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao atualizar serviço realizado: {str(e)}")

@router.delete("/{servico_id}")
async def deletar_servico_realizado(
    servico_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deleta um serviço realizado"""
    try:
        servico = db.query(ServicoRealizado).filter(ServicoRealizado.id == servico_id).first()
        if not servico:
            return create_not_found_response("Serviço realizado")
        
        db.delete(servico)
        db.commit()
        
        return create_delete_response("Serviço realizado deletado com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao deletar serviço realizado: {str(e)}")

@router.get("/os/{os_id}/servicos")
async def listar_servicos_por_os(
    os_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista todos os serviços realizados de uma ordem de serviço específica"""
    try:
        # Verificar se a OS existe
        ordem_servico = db.query(OrdemServico).filter(OrdemServico.id == os_id).first()
        if not ordem_servico:
            return create_not_found_response("Ordem de serviço")
        
        servicos = db.query(ServicoRealizado).filter(ServicoRealizado.abrir_os_id == os_id).all()
        
        items = []
        for servico in servicos:
            items.append({
                "id": servico.id,
                "servico_realizado": servico.servico_realizado,
                "tempo_de_servico_realizado": servico.tempo_de_servico_realizado,
                "abrir_os_id": servico.abrir_os_id,
                "usuario_id": servico.usuario_id,
                "created_at": servico.created_at,
                "usuario": {
                    "id": servico.usuario.id,
                    "username": servico.usuario.username,
                    "nome_completo": servico.usuario.nome_completo
                } if servico.usuario else None
            })
        
        return create_list_response(items, f"Serviços da OS {os_id} listados com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao listar serviços da OS: {str(e)}")
