from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from utils.timezone_utils import brasil_now

class Usuario(Base):
    __tablename__ = "usuario"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    nome_completo = Column(String(100), nullable=False)
    perfil = Column(String(20), default="USUARIO", index=True)
    ativo = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), default=brasil_now())
    updated_at = Column(DateTime(timezone=True), default=brasil_now(), onupdate=brasil_now())
    
    # Relacionamentos
    ordens_servico = relationship("OrdemServico", back_populates="usuario")
    servicos_realizados = relationship("ServicoRealizado", back_populates="usuario")
    pecas_utilizadas = relationship("PecaUtilizada", back_populates="usuario")
    encerramentos_os = relationship("EncerrarOS", back_populates="usuario")
    retiradas_viatura = relationship("RetiradaViatura", back_populates="usuario")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="usuario")

class PasswordResetToken(Base):
    __tablename__ = "password_reset_token"
    
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(255), unique=True, nullable=False, index=True)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    used = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), default=brasil_now())
    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="password_reset_tokens")

class Veiculo(Base):
    __tablename__ = "veiculo"
    
    id = Column(Integer, primary_key=True, index=True)
    marca = Column(String(50), nullable=False)
    modelo = Column(String(50), nullable=False)
    placa = Column(String(10), unique=True, nullable=False, index=True)
    su_cia_viatura = Column(String(50), nullable=False)
    patrimonio = Column(String(20), unique=True, nullable=False, index=True)
    ano_fabricacao = Column(String(4))
    cor = Column(String(30))
    chassi = Column(String(17))
    motor = Column(String(20))
    combustivel = Column(String(20))
    observacoes = Column(Text)
    status = Column(String(20), default="ATIVO", index=True)
    created_at = Column(DateTime(timezone=True), default=brasil_now())
    updated_at = Column(DateTime(timezone=True), default=brasil_now(), onupdate=brasil_now())
    
    # Relacionamentos
    ordens_servico = relationship("OrdemServico", back_populates="veiculo")

class OrdemServico(Base):
    __tablename__ = "ordem_servico"
    
    id = Column(Integer, primary_key=True, index=True)
    data = Column(String(10), nullable=False, index=True)
    veiculo_id = Column(Integer, ForeignKey("veiculo.id"), nullable=False, index=True)
    hodometro = Column(String(10), nullable=False)
    problema_apresentado = Column(Text, nullable=False)
    sistema_afetado = Column(String(50), nullable=False)
    causa_da_avaria = Column(Text, nullable=False)
    manutencao = Column(String(20), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False, index=True)
    perfil = Column(String(20), nullable=False)
    situacao_os = Column(String(20), default="ABERTA", index=True)
    created_at = Column(DateTime(timezone=True), default=brasil_now())
    updated_at = Column(DateTime(timezone=True), default=brasil_now(), onupdate=brasil_now())
    
    # Relacionamentos
    veiculo = relationship("Veiculo", back_populates="ordens_servico")
    usuario = relationship("Usuario", back_populates="ordens_servico")
    servicos_realizados = relationship("ServicoRealizado", back_populates="ordem_servico")
    pecas_utilizadas = relationship("PecaUtilizada", back_populates="ordem_servico")
    encerramentos = relationship("EncerrarOS", back_populates="ordem_servico")

class ServicoRealizado(Base):
    __tablename__ = "servico_realizado"
    
    id = Column(Integer, primary_key=True, index=True)
    servico_realizado = Column(String(200), nullable=False)
    tempo_de_servico_realizado = Column(String(10), nullable=False)
    abrir_os_id = Column(Integer, ForeignKey("ordem_servico.id"), nullable=False, index=True)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=brasil_now())
    
    # Relacionamentos
    ordem_servico = relationship("OrdemServico", back_populates="servicos_realizados")
    usuario = relationship("Usuario", back_populates="servicos_realizados")

class PecaUtilizada(Base):
    __tablename__ = "peca_utilizada"
    
    id = Column(Integer, primary_key=True, index=True)
    peca_utilizada = Column(String(200), nullable=False)
    num_ficha = Column(String(50), nullable=False, index=True)
    qtd = Column(String(10), nullable=False)
    abrir_os_id = Column(Integer, ForeignKey("ordem_servico.id"), nullable=False, index=True)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=brasil_now())
    
    # Relacionamentos
    ordem_servico = relationship("OrdemServico", back_populates="pecas_utilizadas")
    usuario = relationship("Usuario", back_populates="pecas_utilizadas")

class EncerrarOS(Base):
    __tablename__ = "encerrar_os"
    
    id = Column(Integer, primary_key=True, index=True)
    nome_mecanico = Column(String(100), nullable=False, index=True)
    data_da_manutencao = Column(String(10), nullable=False)
    situacao_os = Column(String(20), default="FECHADA", index=True)
    tempo_total = Column(String(10), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False, index=True)
    abrir_os_id = Column(Integer, ForeignKey("ordem_servico.id"), nullable=False, index=True)
    modelo_veiculo = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), default=brasil_now())
    
    # Relacionamentos
    ordem_servico = relationship("OrdemServico", back_populates="encerramentos")
    usuario = relationship("Usuario", back_populates="encerramentos_os")
    retiradas_viatura = relationship("RetiradaViatura", back_populates="encerramento_os")

class RetiradaViatura(Base):
    __tablename__ = "retirada_viatura"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False, index=True)
    data = Column(String(10), nullable=False, index=True)
    encerrar_os_id = Column(Integer, ForeignKey("encerrar_os.id"), nullable=False, index=True)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=brasil_now())
    
    # Relacionamentos
    encerramento_os = relationship("EncerrarOS", back_populates="retiradas_viatura")
    usuario = relationship("Usuario", back_populates="retiradas_viatura")

class LogErro(Base):
    __tablename__ = "log_erro"
    
    id = Column(Integer, primary_key=True, index=True)
    endpoint = Column(String(200), nullable=False, index=True)
    metodo = Column(String(10), nullable=False, index=True)
    erro = Column(Text, nullable=False)
    stack_trace = Column(Text)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), index=True)
    ip_address = Column(String(45))
    created_at = Column(DateTime(timezone=True), default=brasil_now(), index=True)

class LogAPI(Base):
    __tablename__ = "log_api"
    
    id = Column(Integer, primary_key=True, index=True)
    endpoint = Column(String(200), nullable=False, index=True)
    metodo = Column(String(10), nullable=False, index=True)
    status_code = Column(Integer, nullable=False, index=True)
    app_status = Column(String(20), index=True)  # Status da aplicação (success/error)
    tempo_resposta = Column(Integer, nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), index=True)
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    request_data = Column(Text)
    response_data = Column(Text)
    created_at = Column(DateTime(timezone=True), default=brasil_now(), index=True)
