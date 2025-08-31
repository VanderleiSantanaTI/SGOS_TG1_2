import secrets
import string
from datetime import datetime, timedelta
from typing import Optional
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from sqlalchemy.orm import Session
from database import get_db
from models import Usuario, PasswordResetToken
from auth import get_password_hash
from config import settings
from jinja2 import Environment, FileSystemLoader
import os

# Configuração do FastMail
conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username,
    MAIL_PASSWORD=settings.mail_password,
    MAIL_FROM=settings.mail_from,
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server,
    MAIL_FROM_NAME=settings.mail_from_name,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    TEMPLATE_FOLDER='templates'
)

# Configuração do Jinja2 para templates
template_dir = os.path.join(os.path.dirname(__file__), 'templates')
env = Environment(loader=FileSystemLoader(template_dir))

def generate_reset_code() -> str:
    """Gera um código de 6 dígitos para recuperação de senha"""
    return ''.join(secrets.choice(string.digits) for _ in range(6))

def create_password_reset_token(db: Session, email: str) -> Optional[str]:
    """Cria um token de recuperação de senha para o usuário"""
    # Buscar usuário pelo email
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        return None
    
    # Gerar código de 6 dígitos
    reset_code = generate_reset_code()
    
    # Definir expiração (15 minutos)
    expires_at = datetime.utcnow() + timedelta(minutes=settings.password_reset_token_expire_minutes)
    
    # Criar token no banco
    reset_token = PasswordResetToken(
        token=reset_code,
        usuario_id=usuario.id,
        expires_at=expires_at,
        used=False
    )
    
    db.add(reset_token)
    db.commit()
    
    return reset_code

async def send_password_reset_email(email: str, reset_code: str, nome_usuario: str):
    """Envia email com código de recuperação de senha"""
    # Carregar template HTML
    template = env.get_template('password_reset.html')
    
    # Renderizar template com dados
    html_content = template.render(
        nome_usuario=nome_usuario,
        reset_code=reset_code,
        expira_minutos=settings.password_reset_token_expire_minutes,
        sistema_nome="SGOS - Sistema de Gerenciamento de Ordem de Serviço"
    )
    
    # Configurar mensagem
    message = MessageSchema(
        subject="Recuperação de Senha - SGOS",
        recipients=[email],
        body=html_content,
        subtype="html"
    )
    
    # Enviar email
    fm = FastMail(conf)
    await fm.send_message(message)

def verify_reset_token(db: Session, token: str) -> Optional[Usuario]:
    """Verifica se o token de recuperação é válido"""
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()
    
    if not reset_token:
        return None
    
    return reset_token.usuario

def use_reset_token(db: Session, token: str) -> bool:
    """Marca o token como usado"""
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token
    ).first()
    
    if reset_token:
        reset_token.used = True
        db.commit()
        return True
    
    return False

def reset_user_password(db: Session, token: str, new_password: str) -> bool:
    """Redefine a senha do usuário usando o token"""
    usuario = verify_reset_token(db, token)
    if not usuario:
        return False
    
    # Atualizar senha
    usuario.hashed_password = get_password_hash(new_password)
    
    # Marcar token como usado
    use_reset_token(db, token)
    
    db.commit()
    return True

async def process_password_reset_request(db: Session, email: str) -> bool:
    """Processa uma solicitação de recuperação de senha"""
    # Buscar usuário
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        return False
    
    # Criar token
    reset_code = create_password_reset_token(db, email)
    if not reset_code:
        return False
    
    # Enviar email
    try:
        await send_password_reset_email(email, reset_code, usuario.nome_completo)
        return True
    except Exception as e:
        print(f"Erro ao enviar email: {str(e)}")
        return False
