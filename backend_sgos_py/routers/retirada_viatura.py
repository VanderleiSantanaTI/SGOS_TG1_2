from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models import RetiradaViatura, EncerrarOS, Usuario, OrdemServico
from schemas import RetiradaViatura as RetiradaViaturaSchema, RetiradaViaturaCreate, RetiradaViaturaUpdate
from auth import get_current_active_user
from utils.response_utils import (
    create_paginated_response, create_single_item_response, create_create_response,
    create_update_response, create_delete_response, create_not_found_response,
    create_validation_error_response, create_list_response, create_error_response
)

router = APIRouter(prefix="/retirada-viatura", tags=["Retirada de Viatura"])

@router.get("/")
async def listar_retiradas_viatura(
    skip: int = Query(0, ge=0, description="Número de registros para pular"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros"),
    search: Optional[str] = Query(None, description="Termo de busca no nome"),
    encerramento_id: Optional[int] = Query(None, description="Filtrar por ID do encerramento"),
    usuario_id: Optional[int] = Query(None, description="Filtrar por usuário"),
    data: Optional[str] = Query(None, description="Filtrar por data"),
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista retiradas de viatura com paginação e filtros"""
    try:
        query = db.query(RetiradaViatura)
        
        if search:
            query = query.filter(RetiradaViatura.nome.contains(search))
        
        if encerramento_id:
            query = query.filter(RetiradaViatura.encerrar_os_id == encerramento_id)
        
        if usuario_id:
            query = query.filter(RetiradaViatura.usuario_id == usuario_id)
        
        if data:
            query = query.filter(RetiradaViatura.data == data)
        
        total = query.count()
        retiradas = query.offset(skip).limit(limit).all()
        
        items = []
        for retirada in retiradas:
            items.append({
                "id": retirada.id,
                "nome": retirada.nome,
                "data": retirada.data,
                "encerrar_os_id": retirada.encerrar_os_id,
                "usuario_id": retirada.usuario_id,
                "created_at": retirada.created_at,
                "usuario": {
                    "id": retirada.usuario.id,
                    "username": retirada.usuario.username,
                    "nome_completo": retirada.usuario.nome_completo
                } if retirada.usuario else None,
                "encerramento": {
                    "id": retirada.encerramento.id,
                    "nome_mecanico": retirada.encerramento.nome_mecanico,
                    "data_da_manutencao": retirada.encerramento.data_da_manutencao,
                    "modelo_veiculo": retirada.encerramento.modelo_veiculo
                } if retirada.encerramento else None
            })
        
        pages = (total + limit - 1) // limit
        
        return create_paginated_response(
            items=items,
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages,
            message="Retiradas de viatura listadas com sucesso"
        )
        
    except Exception as e:
        return create_error_response(f"Erro ao listar retiradas de viatura: {str(e)}")

@router.get("/{retirada_id}")
async def obter_retirada_viatura(
    retirada_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém uma retirada de viatura específica"""
    try:
        retirada = db.query(RetiradaViatura).filter(RetiradaViatura.id == retirada_id).first()
        if not retirada:
            return create_not_found_response("Retirada de viatura")
        
        retirada_data = {
            "id": retirada.id,
            "nome": retirada.nome,
            "data": retirada.data,
            "encerrar_os_id": retirada.encerrar_os_id,
            "usuario_id": retirada.usuario_id,
            "created_at": retirada.created_at,
            "usuario": {
                "id": retirada.usuario.id,
                "username": retirada.usuario.username,
                "nome_completo": retirada.usuario.nome_completo
            } if retirada.usuario else None,
            "encerramento": {
                "id": retirada.encerramento.id,
                "nome_mecanico": retirada.encerramento.nome_mecanico,
                "data_da_manutencao": retirada.encerramento.data_da_manutencao,
                "modelo_veiculo": retirada.encerramento.modelo_veiculo
            } if retirada.encerramento else None
        }
        
        return create_single_item_response(retirada_data, "Retirada de viatura encontrada com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao buscar retirada de viatura: {str(e)}")

@router.post("/")
async def criar_retirada_viatura(
    retirada_data: RetiradaViaturaCreate,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cria uma nova retirada de viatura"""
    try:
        # Verificar se o encerramento existe
        encerramento = db.query(EncerrarOS).filter(EncerrarOS.id == retirada_data.encerrar_os_id).first()
        if not encerramento:
            return create_validation_error_response(
                ["Encerramento de OS não encontrado"],
                "Encerramento inválido"
            )
        
        # Verificar se a OS está fechada
        ordem_servico = db.query(OrdemServico).filter(OrdemServico.id == encerramento.abrir_os_id).first()
        if not ordem_servico or ordem_servico.situacao_os != "FECHADA":
            return create_validation_error_response(
                ["Só é possível retirar viatura de OS fechada"],
                "Status da OS não permite retirada"
            )
        
        # Atualizar a situação da OS para RETIRADA
        ordem_servico.situacao_os = "RETIRADA"
        
        db_retirada = RetiradaViatura(
            nome=retirada_data.nome,
            data=retirada_data.data,
            encerrar_os_id=retirada_data.encerrar_os_id,
            usuario_id=current_user.id
        )
        
        db.add(db_retirada)
        db.commit()
        db.refresh(db_retirada)
        
        retirada_data_response = {
            "id": db_retirada.id,
            "nome": db_retirada.nome,
            "data": db_retirada.data,
            "encerrar_os_id": db_retirada.encerrar_os_id,
            "usuario_id": db_retirada.usuario_id,
            "created_at": db_retirada.created_at
        }
        
        return create_create_response(retirada_data_response, "Retirada de viatura criada com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao criar retirada de viatura: {str(e)}")

@router.put("/{retirada_id}")
async def atualizar_retirada_viatura(
    retirada_id: int,
    retirada_data: RetiradaViaturaUpdate,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualiza uma retirada de viatura"""
    try:
        retirada = db.query(RetiradaViatura).filter(RetiradaViatura.id == retirada_id).first()
        if not retirada:
            return create_not_found_response("Retirada de viatura")
        
        # Verificar se o encerramento existe (se foi alterado)
        if retirada_data.encerrar_os_id and retirada_data.encerrar_os_id != retirada.encerrar_os_id:
            encerramento = db.query(EncerrarOS).filter(EncerrarOS.id == retirada_data.encerrar_os_id).first()
            if not encerramento:
                return create_validation_error_response(
                    ["Encerramento de OS não encontrado"],
                    "Encerramento inválido"
                )
            
            # Verificar se a OS está fechada
            ordem_servico = db.query(OrdemServico).filter(OrdemServico.id == encerramento.abrir_os_id).first()
            if not ordem_servico or ordem_servico.situacao_os != "FECHADA":
                return create_validation_error_response(
                    ["Só é possível retirar viatura de OS fechada"],
                    "Status da OS não permite retirada"
                )
        
        # Atualizar campos
        update_data = retirada_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(retirada, field, value)
        
        db.commit()
        db.refresh(retirada)
        
        retirada_data_response = {
            "id": retirada.id,
            "nome": retirada.nome,
            "data": retirada.data,
            "encerrar_os_id": retirada.encerrar_os_id,
            "usuario_id": retirada.usuario_id,
            "created_at": retirada.created_at
        }
        
        return create_update_response(retirada_data_response, "Retirada de viatura atualizada com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao atualizar retirada de viatura: {str(e)}")

@router.delete("/{retirada_id}")
async def deletar_retirada_viatura(
    retirada_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deleta uma retirada de viatura"""
    try:
        retirada = db.query(RetiradaViatura).filter(RetiradaViatura.id == retirada_id).first()
        if not retirada:
            return create_not_found_response("Retirada de viatura")
        
        # Reverter a situação da OS para FECHADA
        encerramento = db.query(EncerrarOS).filter(EncerrarOS.id == retirada.encerrar_os_id).first()
        if encerramento:
            ordem_servico = db.query(OrdemServico).filter(OrdemServico.id == encerramento.abrir_os_id).first()
            if ordem_servico:
                ordem_servico.situacao_os = "FECHADA"
        
        db.delete(retirada)
        db.commit()
        
        return create_delete_response("Retirada de viatura deletada com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao deletar retirada de viatura: {str(e)}")

@router.get("/encerramento/{encerramento_id}/retiradas")
async def listar_retiradas_por_encerramento(
    encerramento_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista todas as retiradas de viatura de um encerramento específico"""
    try:
        # Verificar se o encerramento existe
        encerramento = db.query(EncerrarOS).filter(EncerrarOS.id == encerramento_id).first()
        if not encerramento:
            return create_not_found_response("Encerramento de OS")
        
        retiradas = db.query(RetiradaViatura).filter(RetiradaViatura.encerrar_os_id == encerramento_id).all()
        
        items = []
        for retirada in retiradas:
            items.append({
                "id": retirada.id,
                "nome": retirada.nome,
                "data": retirada.data,
                "encerrar_os_id": retirada.encerrar_os_id,
                "usuario_id": retirada.usuario_id,
                "created_at": retirada.created_at,
                "usuario": {
                    "id": retirada.usuario.id,
                    "username": retirada.usuario.username,
                    "nome_completo": retirada.usuario.nome_completo
                } if retirada.usuario else None
            })
        
        return create_list_response(items, f"Retiradas do encerramento {encerramento_id} listadas com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao listar retiradas do encerramento: {str(e)}")
