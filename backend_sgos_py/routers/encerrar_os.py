from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models import EncerrarOS, OrdemServico, Usuario, Veiculo
from schemas import EncerrarOS as EncerrarOSSchema, EncerrarOSCreate, EncerrarOSUpdate
from auth import get_current_active_user
from utils.response_utils import (
    create_paginated_response, create_single_item_response, create_create_response,
    create_update_response, create_delete_response, create_not_found_response,
    create_validation_error_response, create_list_response, create_error_response
)
from datetime import datetime

router = APIRouter(prefix="/encerrar-os", tags=["Encerrar OS"])

@router.get("/")
async def listar_encerramentos_os(
    skip: int = Query(0, ge=0, description="Número de registros para pular"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros"),
    search: Optional[str] = Query(None, description="Termo de busca no nome do mecânico"),
    os_id: Optional[int] = Query(None, description="Filtrar por ID da ordem de serviço"),
    usuario_id: Optional[int] = Query(None, description="Filtrar por usuário"),
    situacao_os: Optional[str] = Query(None, description="Filtrar por situação da OS"),
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista encerramentos de OS com paginação e filtros"""
    try:
        query = db.query(EncerrarOS)
        
        if search:
            query = query.filter(EncerrarOS.nome_mecanico.contains(search))
        
        if os_id:
            query = query.filter(EncerrarOS.abrir_os_id == os_id)
        
        if usuario_id:
            query = query.filter(EncerrarOS.usuario_id == usuario_id)
        
        if situacao_os:
            query = query.filter(EncerrarOS.situacao_os == situacao_os)
        
        total = query.count()
        encerramentos = query.offset(skip).limit(limit).all()
        
        items = []
        for encerramento in encerramentos:
            items.append({
                "id": encerramento.id,
                "nome_mecanico": encerramento.nome_mecanico,
                "data_da_manutencao": encerramento.data_da_manutencao,
                "situacao_os": encerramento.situacao_os,
                "tempo_total": encerramento.tempo_total,
                "abrir_os_id": encerramento.abrir_os_id,
                "modelo_veiculo": encerramento.modelo_veiculo,
                "usuario_id": encerramento.usuario_id,
                "created_at": encerramento.created_at,
                "usuario": {
                    "id": encerramento.usuario.id,
                    "username": encerramento.usuario.username,
                    "nome_completo": encerramento.usuario.nome_completo
                } if encerramento.usuario else None
            })
        
        pages = (total + limit - 1) // limit
        
        return create_paginated_response(
            items=items,
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages,
            message="Encerramentos de OS listados com sucesso"
        )
        
    except Exception as e:
        return create_error_response(f"Erro ao listar encerramentos de OS: {str(e)}")

@router.get("/{encerramento_id}")
async def obter_encerramento_os(
    encerramento_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém um encerramento de OS específico"""
    try:
        encerramento = db.query(EncerrarOS).filter(EncerrarOS.id == encerramento_id).first()
        if not encerramento:
            return create_not_found_response("Encerramento de OS")
        
        encerramento_data = {
            "id": encerramento.id,
            "nome_mecanico": encerramento.nome_mecanico,
            "data_da_manutencao": encerramento.data_da_manutencao,
            "situacao_os": encerramento.situacao_os,
            "tempo_total": encerramento.tempo_total,
            "abrir_os_id": encerramento.abrir_os_id,
            "modelo_veiculo": encerramento.modelo_veiculo,
            "usuario_id": encerramento.usuario_id,
            "created_at": encerramento.created_at,
            "usuario": {
                "id": encerramento.usuario.id,
                "username": encerramento.usuario.username,
                "nome_completo": encerramento.usuario.nome_completo
            } if encerramento.usuario else None
        }
        
        return create_single_item_response(encerramento_data, "Encerramento de OS encontrado com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao buscar encerramento de OS: {str(e)}")

@router.post("/")
async def criar_encerramento_os(
    encerramento_data: EncerrarOSCreate,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cria um novo encerramento de OS"""
    try:
        # Verificar se a ordem de serviço existe
        ordem_servico = db.query(OrdemServico).filter(OrdemServico.id == encerramento_data.abrir_os_id).first()
        if not ordem_servico:
            return create_validation_error_response(
                ["Ordem de serviço não encontrada"],
                "Ordem de serviço inválida"
            )
        
        # Verificar se já existe um encerramento para esta OS
        existing_encerramento = db.query(EncerrarOS).filter(EncerrarOS.abrir_os_id == encerramento_data.abrir_os_id).first()
        if existing_encerramento:
            return create_validation_error_response(
                ["Já existe um encerramento para esta ordem de serviço"],
                "Encerramento já existe"
            )
        
        # Verificar se a OS está aberta
        if ordem_servico.situacao_os not in ["ABERTA"]:
            return create_validation_error_response(
                ["Só é possível encerrar OS aberta"],
                "Status da OS não permite encerramento"
            )
        
        # Buscar informações do veículo para auto-preencher modelo_veiculo
        veiculo = db.query(Veiculo).filter(Veiculo.id == ordem_servico.veiculo_id).first()
        modelo_veiculo = veiculo.modelo if veiculo else "Não informado"
        
        # Auto-preencher campos se não fornecidos
        tempo_total = encerramento_data.tempo_total if encerramento_data.tempo_total else "00:00"
        
        # Atualizar a situação da OS para FECHADA
        ordem_servico.situacao_os = "FECHADA"
        ordem_servico.updated_at = datetime.utcnow()
        
        db_encerramento = EncerrarOS(
            nome_mecanico=encerramento_data.nome_mecanico,
            data_da_manutencao=encerramento_data.data_da_manutencao,
            situacao_os="FECHADA",
            tempo_total=tempo_total,
            abrir_os_id=encerramento_data.abrir_os_id,
            modelo_veiculo=modelo_veiculo,
            usuario_id=current_user.id
        )
        
        db.add(db_encerramento)
        db.commit()
        db.refresh(db_encerramento)
        
        encerramento_data_response = {
            "id": db_encerramento.id,
            "nome_mecanico": db_encerramento.nome_mecanico,
            "data_da_manutencao": db_encerramento.data_da_manutencao,
            "situacao_os": db_encerramento.situacao_os,
            "tempo_total": db_encerramento.tempo_total,
            "abrir_os_id": db_encerramento.abrir_os_id,
            "modelo_veiculo": db_encerramento.modelo_veiculo,
            "usuario_id": db_encerramento.usuario_id,
            "created_at": db_encerramento.created_at
        }
        
        return create_create_response(encerramento_data_response, "Encerramento de OS criado com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao criar encerramento de OS: {str(e)}")

@router.put("/{encerramento_id}")
async def atualizar_encerramento_os(
    encerramento_id: int,
    encerramento_data: EncerrarOSUpdate,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualiza um encerramento de OS"""
    try:
        encerramento = db.query(EncerrarOS).filter(EncerrarOS.id == encerramento_id).first()
        if not encerramento:
            return create_not_found_response("Encerramento de OS")
        
        # Verificar se a ordem de serviço existe (se foi alterada)
        if encerramento_data.abrir_os_id and encerramento_data.abrir_os_id != encerramento.abrir_os_id:
            ordem_servico = db.query(OrdemServico).filter(OrdemServico.id == encerramento_data.abrir_os_id).first()
            if not ordem_servico:
                return create_validation_error_response(
                    ["Ordem de serviço não encontrada"],
                    "Ordem de serviço inválida"
                )
            
            # Verificar se já existe um encerramento para a nova OS
            existing_encerramento = db.query(EncerrarOS).filter(
                EncerrarOS.abrir_os_id == encerramento_data.abrir_os_id,
                EncerrarOS.id != encerramento_id
            ).first()
            if existing_encerramento:
                return create_validation_error_response(
                    ["Já existe um encerramento para esta ordem de serviço"],
                    "Encerramento já existe"
                )
        
        # Atualizar campos
        update_data = encerramento_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(encerramento, field, value)
        
        db.commit()
        db.refresh(encerramento)
        
        encerramento_data_response = {
            "id": encerramento.id,
            "nome_mecanico": encerramento.nome_mecanico,
            "data_da_manutencao": encerramento.data_da_manutencao,
            "situacao_os": encerramento.situacao_os,
            "tempo_total": encerramento.tempo_total,
            "abrir_os_id": encerramento.abrir_os_id,
            "modelo_veiculo": encerramento.modelo_veiculo,
            "usuario_id": encerramento.usuario_id,
            "created_at": encerramento.created_at
        }
        
        return create_update_response(encerramento_data_response, "Encerramento de OS atualizado com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao atualizar encerramento de OS: {str(e)}")

@router.delete("/{encerramento_id}")
async def deletar_encerramento_os(
    encerramento_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deleta um encerramento de OS"""
    try:
        encerramento = db.query(EncerrarOS).filter(EncerrarOS.id == encerramento_id).first()
        if not encerramento:
            return create_not_found_response("Encerramento de OS")
        
        # Verificar se há retiradas de viatura associadas
        from models import RetiradaViatura
        retiradas_count = db.query(RetiradaViatura).filter(RetiradaViatura.encerrar_os_id == encerramento_id).count()
        if retiradas_count > 0:
            return create_validation_error_response(
                ["Não é possível deletar um encerramento que possui retiradas de viatura"],
                "Operação não permitida"
            )
        
        # Reverter a situação da OS para ABERTA
        ordem_servico = db.query(OrdemServico).filter(OrdemServico.id == encerramento.abrir_os_id).first()
        if ordem_servico:
            ordem_servico.situacao_os = "ABERTA"
        
        db.delete(encerramento)
        db.commit()
        
        return create_delete_response("Encerramento de OS deletado com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao deletar encerramento de OS: {str(e)}")

@router.get("/os/{os_id}/encerramento")
async def obter_encerramento_por_os(
    os_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém o encerramento de uma ordem de serviço específica"""
    try:
        # Verificar se a OS existe
        ordem_servico = db.query(OrdemServico).filter(OrdemServico.id == os_id).first()
        if not ordem_servico:
            return create_not_found_response("Ordem de serviço")
        
        encerramento = db.query(EncerrarOS).filter(EncerrarOS.abrir_os_id == os_id).first()
        if not encerramento:
            return create_not_found_response("Encerramento de OS")
        
        encerramento_data = {
            "id": encerramento.id,
            "nome_mecanico": encerramento.nome_mecanico,
            "data_da_manutencao": encerramento.data_da_manutencao,
            "situacao_os": encerramento.situacao_os,
            "tempo_total": encerramento.tempo_total,
            "abrir_os_id": encerramento.abrir_os_id,
            "modelo_veiculo": encerramento.modelo_veiculo,
            "usuario_id": encerramento.usuario_id,
            "created_at": encerramento.created_at,
            "usuario": {
                "id": encerramento.usuario.id,
                "username": encerramento.usuario.username,
                "nome_completo": encerramento.usuario.nome_completo
            } if encerramento.usuario else None
        }
        
        return create_single_item_response(encerramento_data, "Encerramento da OS encontrado com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao buscar encerramento da OS: {str(e)}")

@router.post("/simplificado")
async def encerrar_os_simplificado(
    dados: dict,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Encerra uma OS de forma simplificada, requerendo apenas campos básicos"""
    try:
        # Validar campos obrigatórios
        if not dados.get("abrir_os_id"):
            return create_validation_error_response(
                ["ID da OS é obrigatório"],
                "Campo obrigatório não informado"
            )
        
        if not dados.get("nome_mecanico"):
            return create_validation_error_response(
                ["Nome do mecânico é obrigatório"],
                "Campo obrigatório não informado"
            )
        
        if not dados.get("data_da_manutencao"):
            return create_validation_error_response(
                ["Data da manutenção é obrigatória"],
                "Campo obrigatório não informado"
            )
        
        # Verificar se a ordem de serviço existe
        ordem_servico = db.query(OrdemServico).filter(OrdemServico.id == dados["abrir_os_id"]).first()
        if not ordem_servico:
            return create_validation_error_response(
                ["Ordem de serviço não encontrada"],
                "Ordem de serviço inválida"
            )
        
        # Verificar se já existe um encerramento para esta OS
        existing_encerramento = db.query(EncerrarOS).filter(EncerrarOS.abrir_os_id == dados["abrir_os_id"]).first()
        if existing_encerramento:
            return create_validation_error_response(
                ["Já existe um encerramento para esta ordem de serviço"],
                "Encerramento já existe"
            )
        
        # Verificar se a OS está aberta
        if ordem_servico.situacao_os not in ["ABERTA"]:
            return create_validation_error_response(
                ["Só é possível encerrar OS aberta"],
                "Status da OS não permite encerramento"
            )
        
        # Buscar informações do veículo para auto-preencher modelo_veiculo
        veiculo = db.query(Veiculo).filter(Veiculo.id == ordem_servico.veiculo_id).first()
        modelo_veiculo = veiculo.modelo if veiculo else "Não informado"
        
        # Atualizar a situação da OS para FECHADA
        ordem_servico.situacao_os = "FECHADA"
        ordem_servico.updated_at = datetime.utcnow()
        
        db_encerramento = EncerrarOS(
            nome_mecanico=dados["nome_mecanico"],
            data_da_manutencao=dados["data_da_manutencao"],
            situacao_os="FECHADA",
            tempo_total="00:00",  # Valor padrão
            abrir_os_id=dados["abrir_os_id"],
            modelo_veiculo=modelo_veiculo,
            usuario_id=current_user.id
        )
        
        db.add(db_encerramento)
        db.commit()
        db.refresh(db_encerramento)
        
        encerramento_data_response = {
            "id": db_encerramento.id,
            "nome_mecanico": db_encerramento.nome_mecanico,
            "data_da_manutencao": db_encerramento.data_da_manutencao,
            "situacao_os": db_encerramento.situacao_os,
            "tempo_total": db_encerramento.tempo_total,
            "abrir_os_id": db_encerramento.abrir_os_id,
            "modelo_veiculo": db_encerramento.modelo_veiculo,
            "usuario_id": db_encerramento.usuario_id,
            "created_at": db_encerramento.created_at,
            "os_atualizada": {
                "id": ordem_servico.id,
                "situacao_os": ordem_servico.situacao_os,
                "updated_at": ordem_servico.updated_at
            }
        }
        
        return create_create_response(encerramento_data_response, "OS encerrada com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao encerrar OS: {str(e)}")
