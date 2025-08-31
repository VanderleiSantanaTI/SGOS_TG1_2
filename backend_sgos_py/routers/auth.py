from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from models import Usuario
from schemas import Token, LoginRequest, PasswordResetRequest, PasswordResetConfirm, PasswordResetResponse
from pydantic import BaseModel
from auth import authenticate_user, create_access_token, get_current_active_user, verify_password, get_password_hash
from email_service import process_password_reset_request, reset_user_password
from config import settings
from utils.response_utils import (
    create_auth_response, create_success_response, create_error_response,
    create_unauthorized_response, create_validation_error_response
)

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/login")
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    print('login_data:', login_data)
    """Endpoint para login e obtenção de token JWT"""
    try:
        user = authenticate_user(db, login_data.username, login_data.password)
        if not user:
            return create_unauthorized_response("Usuário ou senha incorretos")
        
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "nome_completo": user.nome_completo,
            "perfil": user.perfil,
            "ativo": user.ativo
        }
        
        return create_auth_response(access_token, user_data, "Login realizado com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro interno do servidor: {str(e)}")

@router.post("/login-form")
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Endpoint para login usando form data (compatibilidade com OAuth2)"""
    try:
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            return create_unauthorized_response("Usuário ou senha incorretos")
        
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "nome_completo": user.nome_completo,
            "perfil": user.perfil,
            "ativo": user.ativo
        }
        
        return create_auth_response(access_token, user_data, "Login realizado com sucesso")
        
    except Exception as e:
        return create_error_response(f"Erro interno do servidor: {str(e)}")

@router.post("/forgot-password")
async def forgot_password(
    reset_request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """Solicita recuperação de senha via email"""
    try:
        success = await process_password_reset_request(db, reset_request.email)
        
        # Por segurança, sempre retornamos sucesso mesmo se o email não existir
        return create_success_response(
            "Se o email estiver cadastrado em nossa base, você receberá um código de recuperação em breve."
        )
        
    except Exception as e:
        return create_error_response(f"Erro interno do servidor: {str(e)}")

@router.post("/reset-password")
async def reset_password(
    reset_confirm: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """Redefine a senha usando o token de recuperação"""
    try:
        success = reset_user_password(db, reset_confirm.token, reset_confirm.new_password)
        
        if success:
            return create_success_response(
                "Senha redefinida com sucesso! Você pode fazer login com sua nova senha."
            )
        else:
            return create_validation_error_response(
                ["Token inválido, expirado ou já utilizado"],
                "Token inválido"
            )
        
    except Exception as e:
        return create_error_response(f"Erro interno do servidor: {str(e)}")


