from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Schemas para Usuario
class UsuarioBase(BaseModel):
    username: str
    email: EmailStr
    nome_completo: str
    perfil: str = "USUARIO"
    ativo: bool = True

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    nome_completo: Optional[str] = None
    perfil: Optional[str] = None
    ativo: Optional[bool] = None
    password: Optional[str] = None

class Usuario(UsuarioBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Schemas para Veiculo
class VeiculoBase(BaseModel):
    marca: str
    modelo: str
    placa: str
    su_cia_viatura: str
    patrimonio: str
    ano_fabricacao: Optional[str] = None
    cor: Optional[str] = None
    chassi: Optional[str] = None
    motor: Optional[str] = None
    combustivel: Optional[str] = None
    observacoes: Optional[str] = None
    status: str = "ATIVO"

class VeiculoCreate(VeiculoBase):
    pass

class VeiculoUpdate(BaseModel):
    marca: Optional[str] = None
    modelo: Optional[str] = None
    placa: Optional[str] = None
    su_cia_viatura: Optional[str] = None
    patrimonio: Optional[str] = None
    ano_fabricacao: Optional[str] = None
    cor: Optional[str] = None
    chassi: Optional[str] = None
    motor: Optional[str] = None
    combustivel: Optional[str] = None
    observacoes: Optional[str] = None
    status: Optional[str] = None

class Veiculo(VeiculoBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Schemas para OrdemServico
class OrdemServicoBase(BaseModel):
    data: str
    veiculo_id: int
    hodometro: str
    problema_apresentado: str
    sistema_afetado: str
    causa_da_avaria: str
    manutencao: str
    perfil: str
    situacao_os: str = "ABERTA"

class OrdemServicoCreate(OrdemServicoBase):
    pass

class OrdemServicoUpdate(BaseModel):
    data: Optional[str] = None
    veiculo_id: Optional[int] = None
    hodometro: Optional[str] = None
    problema_apresentado: Optional[str] = None
    sistema_afetado: Optional[str] = None
    causa_da_avaria: Optional[str] = None
    manutencao: Optional[str] = None
    perfil: Optional[str] = None
    situacao_os: Optional[str] = None

class OrdemServico(OrdemServicoBase):
    id: int
    usuario_id: int
    created_at: datetime
    updated_at: datetime
    veiculo: Optional[Veiculo] = None
    usuario: Optional[Usuario] = None
    
    class Config:
        from_attributes = True

# Schemas para ServicoRealizado
class ServicoRealizadoBase(BaseModel):
    servico_realizado: str
    tempo_de_servico_realizado: str
    abrir_os_id: int

class ServicoRealizadoCreate(ServicoRealizadoBase):
    pass

class ServicoRealizadoUpdate(BaseModel):
    servico_realizado: Optional[str] = None
    tempo_de_servico_realizado: Optional[str] = None
    abrir_os_id: Optional[int] = None

class ServicoRealizado(ServicoRealizadoBase):
    id: int
    usuario_id: int
    created_at: datetime
    usuario: Optional[Usuario] = None
    
    class Config:
        from_attributes = True

# Schemas para PecaUtilizada
class PecaUtilizadaBase(BaseModel):
    peca_utilizada: str
    num_ficha: str
    qtd: str
    abrir_os_id: int

class PecaUtilizadaCreate(PecaUtilizadaBase):
    pass

class PecaUtilizadaUpdate(BaseModel):
    peca_utilizada: Optional[str] = None
    num_ficha: Optional[str] = None
    qtd: Optional[str] = None
    abrir_os_id: Optional[int] = None

class PecaUtilizada(PecaUtilizadaBase):
    id: int
    usuario_id: int
    created_at: datetime
    usuario: Optional[Usuario] = None
    
    class Config:
        from_attributes = True

# Schemas para EncerrarOS
class EncerrarOSBase(BaseModel):
    nome_mecanico: str
    data_da_manutencao: str
    situacao_os: str = "FECHADA"
    tempo_total: Optional[str] = "00:00"
    abrir_os_id: int
    modelo_veiculo: Optional[str] = None

class EncerrarOSCreate(EncerrarOSBase):
    pass

class EncerrarOSUpdate(BaseModel):
    nome_mecanico: Optional[str] = None
    data_da_manutencao: Optional[str] = None
    situacao_os: Optional[str] = None
    tempo_total: Optional[str] = None
    abrir_os_id: Optional[int] = None
    modelo_veiculo: Optional[str] = None

class EncerrarOS(EncerrarOSBase):
    id: int
    usuario_id: int
    created_at: datetime
    usuario: Optional[Usuario] = None
    
    class Config:
        from_attributes = True

# Schemas para RetiradaViatura
class RetiradaViaturaBase(BaseModel):
    nome: str
    data: str
    encerrar_os_id: int

class RetiradaViaturaCreate(RetiradaViaturaBase):
    pass

class RetiradaViaturaUpdate(BaseModel):
    nome: Optional[str] = None
    data: Optional[str] = None
    encerrar_os_id: Optional[int] = None

class RetiradaViatura(RetiradaViaturaBase):
    id: int
    usuario_id: int
    created_at: datetime
    usuario: Optional[Usuario] = None
    
    class Config:
        from_attributes = True

# Schemas para Autenticação
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Usuario

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Schemas para Recuperação de Senha
class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class PasswordResetResponse(BaseModel):
    message: str
    success: bool = True

# Schemas para Respostas Padronizadas
from datetime import datetime
from typing import Any, Optional

class BaseResponse(BaseModel):
    status: str  # "success", "error", "warning", "info"
    message: str
    timestamp: datetime
    data: Optional[Any] = None

class SuccessResponse(BaseResponse):
    status: str = "success"
    timestamp: datetime = datetime.now()

class ErrorResponse(BaseResponse):
    status: str = "error"
    timestamp: datetime = datetime.now()

class WarningResponse(BaseResponse):
    status: str = "warning"
    timestamp: datetime = datetime.now()

class InfoResponse(BaseResponse):
    status: str = "info"
    timestamp: datetime = datetime.now()

class MessageResponse(BaseModel):
    status: str = "success"
    message: str
    timestamp: datetime = datetime.now()
    data: Optional[Any] = None

class PaginatedResponse(BaseModel):
    status: str = "success"
    message: str = "Dados recuperados com sucesso"
    timestamp: datetime = datetime.now()
    data: dict = {
        "items": [],
        "total": 0,
        "page": 1,
        "size": 10,
        "pages": 0
    }

# Schemas para Recuperação de Senha
class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class PasswordResetResponse(BaseModel):
    status: str = "success"
    message: str
    timestamp: datetime = datetime.now()
    data: Optional[Any] = None
