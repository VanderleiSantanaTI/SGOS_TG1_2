from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Veiculo, Usuario
from schemas import Veiculo as VeiculoSchema, VeiculoCreate, VeiculoUpdate, MessageResponse, PaginatedResponse
from auth import get_current_active_user
from utils.response_utils import (
    create_paginated_response, create_single_item_response, create_create_response,
    create_update_response, create_delete_response, create_not_found_response,
    create_validation_error_response, create_list_response, create_error_response
)

router = APIRouter(prefix="/veiculos", tags=["Veículos"])

@router.get("/")
async def listar_veiculos(
    skip: int = Query(0, ge=0, description="Número de registros para pular"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros"),
    search: Optional[str] = Query(None, description="Termo de busca"),
    marca: Optional[str] = Query(None, description="Filtrar por marca"),
    modelo: Optional[str] = Query(None, description="Filtrar por modelo"),
    placa: Optional[str] = Query(None, description="Filtrar por placa"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    su_cia_viatura: Optional[str] = Query(None, description="Filtrar por SU/CIA"),
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista veículos com paginação e filtros"""
    try:
        query = db.query(Veiculo)
        
        if search:
            query = query.filter(
                (Veiculo.marca.contains(search)) |
                (Veiculo.modelo.contains(search)) |
                (Veiculo.placa.contains(search)) |
                (Veiculo.patrimonio.contains(search)) |
                (Veiculo.su_cia_viatura.contains(search))
            )
        
        if marca:
            query = query.filter(Veiculo.marca == marca)
        
        if modelo:
            query = query.filter(Veiculo.modelo == modelo)
        
        if placa:
            query = query.filter(Veiculo.placa.contains(placa))
        
        if status:
            query = query.filter(Veiculo.status == status)
        
        if su_cia_viatura:
            query = query.filter(Veiculo.su_cia_viatura.contains(su_cia_viatura))
        
        total = query.count()
        veiculos = query.offset(skip).limit(limit).all()
        
        items = []
        for veiculo in veiculos:
            items.append({
                "id": veiculo.id,
                "marca": veiculo.marca,
                "modelo": veiculo.modelo,
                "placa": veiculo.placa,
                "su_cia_viatura": veiculo.su_cia_viatura,
                "patrimonio": veiculo.patrimonio,
                "ano_fabricacao": veiculo.ano_fabricacao,
                "cor": veiculo.cor,
                "chassi": veiculo.chassi,
                "motor": veiculo.motor,
                "combustivel": veiculo.combustivel,
                "observacoes": veiculo.observacoes,
                "status": veiculo.status,
                "created_at": veiculo.created_at,
                "updated_at": veiculo.updated_at
            })
        
        pages = (total + limit - 1) // limit
        
        return create_paginated_response(
            items=items,
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages,
            message="Veículos listados com sucesso"
        )
        
    except Exception as e:
        return create_error_response(f"Erro ao listar veículos: {str(e)}")

@router.get("/{veiculo_id}")
async def obter_veiculo(
    veiculo_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém um veículo específico"""
    veiculo = db.query(Veiculo).filter(Veiculo.id == veiculo_id).first()
    if not veiculo:
        return create_not_found_response("Veículo")
    
    return create_single_item_response(veiculo, "Veículo obtido com sucesso")

@router.post("/")
async def criar_veiculo(
    veiculo_data: VeiculoCreate,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cria um novo veículo"""
    # Verificar se placa já existe
    existing_placa = db.query(Veiculo).filter(Veiculo.placa == veiculo_data.placa).first()
    if existing_placa:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Placa já existe"
        )
    
    # Verificar se patrimônio já existe
    existing_patrimonio = db.query(Veiculo).filter(Veiculo.patrimonio == veiculo_data.patrimonio).first()
    if existing_patrimonio:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patrimônio já existe"
        )
    
    db_veiculo = Veiculo(**veiculo_data.dict())
    db.add(db_veiculo)
    db.commit()
    db.refresh(db_veiculo)
    
    # Retornar no formato padrão
    return create_single_item_response(db_veiculo, "Veículo criado com sucesso")

@router.put("/{veiculo_id}")
async def atualizar_veiculo(
    veiculo_id: int,
    veiculo_data: VeiculoUpdate,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualiza um veículo"""
    veiculo = db.query(Veiculo).filter(Veiculo.id == veiculo_id).first()
    if not veiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Veículo não encontrado"
        )
    
    # Verificar se placa já existe (se foi alterada)
    if veiculo_data.placa and veiculo_data.placa != veiculo.placa:
        existing_placa = db.query(Veiculo).filter(Veiculo.placa == veiculo_data.placa).first()
        if existing_placa:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Placa já existe"
            )
    
    # Verificar se patrimônio já existe (se foi alterado)
    if veiculo_data.patrimonio and veiculo_data.patrimonio != veiculo.patrimonio:
        existing_patrimonio = db.query(Veiculo).filter(Veiculo.patrimonio == veiculo_data.patrimonio).first()
        if existing_patrimonio:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Patrimônio já existe"
            )
    
    # Atualizar campos
    update_data = veiculo_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(veiculo, field, value)
    
    db.commit()
    db.refresh(veiculo)
    
    # Retornar no formato padrão
    return create_single_item_response(veiculo, "Veículo atualizado com sucesso")

@router.delete("/{veiculo_id}", response_model=MessageResponse)
async def deletar_veiculo(
    veiculo_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deleta um veículo"""
    veiculo = db.query(Veiculo).filter(Veiculo.id == veiculo_id).first()
    if not veiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Veículo não encontrado"
        )
    
    # Verificar se o veículo tem ordens de serviço associadas
    from models import OrdemServico
    ordens_count = db.query(OrdemServico).filter(OrdemServico.veiculo_id == veiculo_id).count()
    if ordens_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível deletar um veículo que possui ordens de serviço"
        )
    
    db.delete(veiculo)
    db.commit()
    
    return MessageResponse(message="Veículo deletado com sucesso")

@router.get("/marcas/lista", response_model=List[str])
async def listar_marcas(
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista todas as marcas disponíveis"""
    marcas = db.query(Veiculo.marca).distinct().all()
    return [marca[0] for marca in marcas if marca[0]]

@router.get("/modelos/lista", response_model=List[str])
async def listar_modelos(
    marca: Optional[str] = Query(None, description="Filtrar por marca"),
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista todos os modelos disponíveis"""
    query = db.query(Veiculo.modelo).distinct()
    if marca:
        query = query.filter(Veiculo.marca == marca)
    
    modelos = query.all()
    return [modelo[0] for modelo in modelos if modelo[0]]

@router.get("/status/lista", response_model=List[str])
async def listar_status(
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista todos os status disponíveis"""
    status_list = db.query(Veiculo.status).distinct().all()
    return [status[0] for status in status_list if status[0]]

@router.get("/{veiculo_id}/relatorio-retirada")
async def gerar_relatorio_retirada(
    veiculo_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Gera relatório personalizado da viatura quando estiver com status RETIRADA"""
    try:
        # Buscar o veículo
        veiculo = db.query(Veiculo).filter(Veiculo.id == veiculo_id).first()
        if not veiculo:
            return create_not_found_response("Veículo")
        
        # Verificar se o veículo está com status RETIRADA
        if veiculo.status != "RETIRADA":
            return create_validation_error_response(
                ["Só é possível gerar relatório de viatura com status RETIRADA"],
                "Status da viatura não permite geração de relatório"
            )
        
        # Buscar a OS mais recente com status RETIRADA
        from models import OrdemServico
        ordem_servico = db.query(OrdemServico).filter(
            OrdemServico.veiculo_id == veiculo_id,
            OrdemServico.situacao_os == "RETIRADA"
        ).order_by(OrdemServico.created_at.desc()).first()
        
        if not ordem_servico:
            return create_not_found_response("Ordem de serviço com status RETIRADA")
        
        # Buscar o encerramento da OS
        from models import EncerrarOS
        encerramento = db.query(EncerrarOS).filter(EncerrarOS.abrir_os_id == ordem_servico.id).first()
        
        # Buscar retiradas de viatura
        from models import RetiradaViatura
        retiradas = db.query(RetiradaViatura).filter(RetiradaViatura.encerrar_os_id == encerramento.id).all() if encerramento else []
        
        # Buscar serviços realizados
        from models import ServicoRealizado
        servicos_realizados = db.query(ServicoRealizado).filter(ServicoRealizado.abrir_os_id == ordem_servico.id).all()
        
        # Buscar peças utilizadas
        from models import PecaUtilizada
        pecas_utilizadas = db.query(PecaUtilizada).filter(PecaUtilizada.abrir_os_id == ordem_servico.id).all()
        
        # Calcular tempo total de serviços
        tempo_total_servicos = "00:00"
        if servicos_realizados:
            # Implementar lógica para somar tempos (formato HH:MM)
            total_minutos = 0
            for servico in servicos_realizados:
                tempo = servico.tempo_de_servico_realizado
                if ":" in tempo:
                    horas, minutos = map(int, tempo.split(":"))
                    total_minutos += horas * 60 + minutos
                else:
                    total_minutos += int(tempo) if tempo.isdigit() else 0
            
            horas_total = total_minutos // 60
            minutos_total = total_minutos % 60
            tempo_total_servicos = f"{horas_total:02d}:{minutos_total:02d}"
        
        # Calcular total de peças
        total_pecas = sum(int(peca.qtd) if peca.qtd.isdigit() else 0 for peca in pecas_utilizadas)
        
        # Montar relatório
        relatorio = {
            "veiculo": {
                "id": veiculo.id,
                "marca": veiculo.marca,
                "modelo": veiculo.modelo,
                "placa": veiculo.placa,
                "patrimonio": veiculo.patrimonio,
                "su_cia_viatura": veiculo.su_cia_viatura,
                "ano_fabricacao": veiculo.ano_fabricacao,
                "cor": veiculo.cor,
                "chassi": veiculo.chassi,
                "motor": veiculo.motor,
                "combustivel": veiculo.combustivel,
                "status": veiculo.status
            },
            "ordem_servico": {
                "id": ordem_servico.id,
                "data": ordem_servico.data,
                "hodometro": ordem_servico.hodometro,
                "problema_apresentado": ordem_servico.problema_apresentado,
                "sistema_afetado": ordem_servico.sistema_afetado,
                "causa_da_avaria": ordem_servico.causa_da_avaria,
                "manutencao": ordem_servico.manutencao,
                "situacao_os": ordem_servico.situacao_os,
                "created_at": ordem_servico.created_at,
                "usuario": {
                    "id": ordem_servico.usuario.id,
                    "username": ordem_servico.usuario.username,
                    "nome_completo": ordem_servico.usuario.nome_completo
                } if ordem_servico.usuario else None
            },
            "encerramento": {
                "id": encerramento.id,
                "nome_mecanico": encerramento.nome_mecanico,
                "data_da_manutencao": encerramento.data_da_manutencao,
                "situacao_os": encerramento.situacao_os,
                "tempo_total": encerramento.tempo_total,
                "modelo_veiculo": encerramento.modelo_veiculo,
                "created_at": encerramento.created_at
            } if encerramento else None,
            "retiradas_viatura": [
                {
                    "id": retirada.id,
                    "nome": retirada.nome,
                    "data": retirada.data,
                    "created_at": retirada.created_at,
                    "usuario": {
                        "id": retirada.usuario.id,
                        "username": retirada.usuario.username,
                        "nome_completo": retirada.usuario.nome_completo
                    } if retirada.usuario else None
                } for retirada in retiradas
            ],
            "servicos_realizados": [
                {
                    "id": servico.id,
                    "servico_realizado": servico.servico_realizado,
                    "tempo_de_servico_realizado": servico.tempo_de_servico_realizado,
                    "created_at": servico.created_at,
                    "usuario": {
                        "id": servico.usuario.id,
                        "username": servico.usuario.username,
                        "nome_completo": servico.usuario.nome_completo
                    } if servico.usuario else None
                } for servico in servicos_realizados
            ],
            "pecas_utilizadas": [
                {
                    "id": peca.id,
                    "peca_utilizada": peca.peca_utilizada,
                    "num_ficha": peca.num_ficha,
                    "qtd": peca.qtd,
                    "created_at": peca.created_at,
                    "usuario": {
                        "id": peca.usuario.id,
                        "username": peca.usuario.username,
                        "nome_completo": peca.usuario.nome_completo
                    } if peca.usuario else None
                } for peca in pecas_utilizadas
            ],
            "resumo": {
                "total_servicos": len(servicos_realizados),
                "tempo_total_servicos": tempo_total_servicos,
                "total_pecas": total_pecas,
                "total_pecas_diferentes": len(pecas_utilizadas),
                "total_retiradas": len(retiradas),
                "data_retirada": retiradas[0].data if retiradas else None,
                "responsavel_retirada": retiradas[0].nome if retiradas else None
            },
            "gerado_em": "2024-01-01T12:00:00",  # Será dinâmico
            "gerado_por": {
                "id": current_user.id,
                "username": current_user.username,
                "nome_completo": current_user.nome_completo
            }
        }
        
        return create_single_item_response(relatorio, "Relatório de retirada gerado com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro ao gerar relatório de retirada: {str(e)}")
