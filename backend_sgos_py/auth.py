from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models import Usuario
from schemas import TokenData
from config import settings

# Configuração de segurança
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha está correta"""
    # Compatibilidade com hashes antigos (temporário)
    if hashed_password.startswith("SIMPLE_HASH:"):
        expected_password = hashed_password.replace("SIMPLE_HASH:", "")
        return plain_password == expected_password
    
    # Verificação normal com bcrypt
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"⚠️ Erro no bcrypt: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Gera hash da senha usando bcrypt"""
    try:
        return pwd_context.hash(password)
    except Exception as e:
        print(f"⚠️ Erro ao gerar hash bcrypt: {e}")
        # Fallback temporário apenas em caso de erro
        return f"SIMPLE_HASH:{password}"

def authenticate_user(db: Session, username: str, password: str) -> Optional[Usuario]:
    """Autentica o usuário"""
    user = db.query(Usuario).filter(Usuario.username == username).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.ativo:
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Cria token de acesso JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def verify_token(token: str) -> Optional[TokenData]:
    """Verifica e decodifica o token JWT"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        username: str = payload.get("sub")
        if username is None:
            return None
        token_data = TokenData(username=username)
        return token_data
    except JWTError:
        return None

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Usuario:
    """Obtém o usuário atual baseado no token"""
    if not settings.enable_token_validation:
        # Se a validação de token estiver desabilitada, retorna um usuário padrão
        return db.query(Usuario).filter(Usuario.username == "admin").first()
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token_data = verify_token(credentials.credentials)
        if token_data is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(Usuario).filter(Usuario.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    if not user.ativo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo"
        )
    
    return user

async def get_current_active_user(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    """Verifica se o usuário atual está ativo"""
    if not current_user.ativo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo"
        )
    return current_user

def check_admin_permission(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
    """Verifica se o usuário tem permissão de administrador"""
    if current_user.perfil != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissão insuficiente"
        )
    return current_user
