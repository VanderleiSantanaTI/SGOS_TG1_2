#!/usr/bin/env python3
"""
Script para criar o arquivo .env automaticamente
Execute este script para configurar as variáveis de ambiente
"""

import os

def create_env_file():
    """Cria o arquivo .env com as configurações padrão"""
    
    env_content = """# Configurações de Email
# Substitua pelos seus dados reais do Gmail
MAIL_USERNAME=vsatech@sgos.cloud
MAIL_PASSWORD=@Vsa.999393
MAIL_FROM=vsatech@sgos.cloud
MAIL_PORT=465
MAIL_SERVER=smtp.hostinger.com
MAIL_FROM_NAME=SGOS - Sistema de Gerenciamento

# Configurações de Segurança
SECRET_KEY=sua_chave_secreta_muito_segura_aqui_altere_em_producao
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Configurações de Banco de Dados
DATABASE_URL=sqlite:///./sgos.db

# Configurações de Reset de Senha
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=15

# Configurações de Log
LOG_LEVEL=INFO
LOG_FILE=logs/sgos.log
"""
    
    try:
        with open('.env', 'w', encoding='utf-8') as f:
            f.write(env_content)
        
        print("✅ Arquivo .env criado com sucesso!")
        print("📝 Agora você precisa editar o arquivo .env e configurar:")
        print("   - MAIL_USERNAME: seu email Gmail")
        print("   - MAIL_PASSWORD: sua senha de app do Gmail")
        print("   - MAIL_FROM: seu email Gmail")
        print("\n🔧 Depois execute: python test_email.py")
        
    except Exception as e:
        print(f"❌ Erro ao criar arquivo .env: {str(e)}")

def check_env_exists():
    """Verifica se o arquivo .env já existe"""
    if os.path.exists('.env'):
        print("⚠️  Arquivo .env já existe!")
        response = input("Deseja sobrescrever? (s/n): ").lower()
        return response == 's'
    return True

if __name__ == "__main__":
    print("🚀 Criador de Arquivo .env - SGOS")
    print("=" * 40)
    
    if check_env_exists():
        create_env_file()
    else:
        print("❌ Operação cancelada.")
