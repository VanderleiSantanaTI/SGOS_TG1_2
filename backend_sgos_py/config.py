from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    # database_url: str = "mysql+pymysql://root:password@localhost:3306/sgos_db"
    # Padrão para SQLite local usando o arquivo sgos.db na raiz do projeto
    database_url: str = "sqlite:///./sgos.db"
    
    # JWT
    secret_key: str = "@@@"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    
    # Security
    enable_token_validation: bool = True
    
    # Email Configuration
    mail_username: str = "valores@email.com"
    mail_password: str = "@@@@"
    mail_from: str = "valores@email.com"
    mail_port: int = 46
    mail_use_tls: bool = False
    mail_server: str = "smtp.h.com"
    mail_from_name: str = "SGOS - Sistema de Gerenciamento"
    
    # Password Reset
    password_reset_token_expire_minutes: int = 15
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "logs/sgos.log"
    
    class Config:
        env_file = ".env"
    
settings = Settings()
