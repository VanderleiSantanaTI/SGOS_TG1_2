import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from database import Base, engine
from models import Usuario, Veiculo, OrdemServico, ServicoRealizado, PecaUtilizada, EncerrarOS, RetiradaViatura
from auth import get_password_hash
from config import settings

def init_database():
    """Inicializa o banco de dados e cria as tabelas"""
    try:
        # Criar todas as tabelas
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas criadas com sucesso!")
        
        # Criar sessão
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Verificar se já existem dados
        user_count = db.query(Usuario).count()
        if user_count > 0:
            print("✅ Banco de dados já possui dados. Pulando inserção de dados de exemplo.")
            db.close()
            return
        
        print("📝 Inserindo dados de exemplo...")
        
        # Inserir usuário administrador
        admin_user = Usuario(
            username="admin",
            email="admin@sgos.com",
            hashed_password=get_password_hash("admin123"),
            nome_completo="Administrador do Sistema",
            perfil="ADMIN",
            ativo=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print("✅ Usuário administrador criado")
        
        # Inserir veículos de exemplo
        veiculos = [
            {
                "marca": "CHEVROLET",
                "modelo": "TRAILBLAZER",
                "placa": "JKL4578",
                "su_cia_viatura": "1ª CIA",
                "patrimonio": "236582477",
                "ano_fabricacao": "2020",
                "cor": "Branco",
                "chassi": "9BWDE21J234000001",
                "motor": "2.0 Turbo",
                "combustivel": "Flex",
                "status": "ATIVO"
            },
            {
                "marca": "FORD",
                "modelo": "RANGER",
                "placa": "MNO7891",
                "su_cia_viatura": "2ª CIA",
                "patrimonio": "212345671",
                "ano_fabricacao": "2021",
                "cor": "Prata",
                "chassi": "9BWDE21J234000002",
                "motor": "3.2 Diesel",
                "combustivel": "Diesel",
                "status": "ATIVO"
            }
        ]
        
        for veiculo_data in veiculos:
            veiculo = Veiculo(**veiculo_data)
            db.add(veiculo)
        
        db.commit()
        print("✅ Veículos de exemplo criados")
        
        db.close()
        print("\n🎉 Banco de dados inicializado com sucesso!")
        print("\n📋 Dados de acesso:")
        print("   Usuário: admin")
        print("   Senha: admin123")
        print("   Email: admin@sgos.com")
        print("\n⚠️  IMPORTANTE: Altere a senha do usuário admin após o primeiro login!")
        
    except Exception as e:
        print(f"❌ Erro ao inicializar banco de dados: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    init_database()
