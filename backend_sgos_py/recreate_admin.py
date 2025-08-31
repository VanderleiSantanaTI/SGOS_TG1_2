#!/usr/bin/env python3
"""Script para recriar o usuário admin completamente"""

from sqlalchemy.orm import sessionmaker
from database import engine
from models import Usuario
from auth import get_password_hash

def recreate_admin():
    # Criar sessão
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Deletar usuário admin existente
        admin_user = db.query(Usuario).filter(Usuario.username == "admin").first()
        if admin_user:
            print(f"🗑️ Removendo usuário admin existente...")
            db.delete(admin_user)
            db.commit()
        
        # Criar novo usuário admin
        print("👤 Criando novo usuário admin...")
        novo_admin = Usuario(
            username="admin",
            email="admin@sgos.com",
            hashed_password=get_password_hash("admin123"),
            nome_completo="Administrador do Sistema",
            perfil="ADMIN",
            ativo=True
        )
        
        db.add(novo_admin)
        db.commit()
        db.refresh(novo_admin)
        
        print(f"✅ Usuário admin recriado com sucesso!")
        print(f"👤 Username: {novo_admin.username}")
        print(f"📧 Email: {novo_admin.email}")
        print(f"🔑 Hash: {novo_admin.hashed_password[:50]}...")
        
        # Testar verificação
        from auth import verify_password
        teste = verify_password("admin123", novo_admin.hashed_password)
        print(f"🧪 Teste de verificação: {'✅ SUCESSO' if teste else '❌ FALHOU'}")
        
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    recreate_admin()
