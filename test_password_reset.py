#!/usr/bin/env python3
"""
Script para testar a funcionalidade de recuperação de senha
"""

import asyncio
from database import get_db
from models import Usuario, PasswordResetToken
from email_service import process_password_reset_request, verify_reset_token, reset_user_password
from sqlalchemy.orm import Session

async def test_password_reset():
    """Testa o fluxo completo de recuperação de senha"""
    
    email = "vanderlei_pqd@hotmail.com"
    
    print("🔍 Testando recuperação de senha para:", email)
    print("=" * 50)
    
    # Obter sessão do banco
    db = next(get_db())
    
    try:
        # 1. Verificar se o usuário existe
        print("1. Verificando se o usuário existe...")
        usuario = db.query(Usuario).filter(Usuario.email == email).first()
        
        if not usuario:
            print("❌ Usuário não encontrado no banco de dados")
            print("   Email:", email)
            return False
        
        print(f"✅ Usuário encontrado: {usuario.nome_completo}")
        print(f"   Username: {usuario.username}")
        print(f"   Perfil: {usuario.perfil}")
        
        # 2. Testar processo de recuperação
        print("\n2. Testando processo de recuperação...")
        success = await process_password_reset_request(db, email)
        
        if not success:
            print("❌ Falha no processo de recuperação")
            return False
        
        print("✅ Processo de recuperação iniciado com sucesso")
        
        # 3. Verificar se o token foi criado
        print("\n3. Verificando token criado...")
        token_obj = db.query(PasswordResetToken).filter(
            PasswordResetToken.usuario_id == usuario.id,
            PasswordResetToken.used == False
        ).order_by(PasswordResetToken.created_at.desc()).first()
        
        if not token_obj:
            print("❌ Token não foi criado")
            return False
        
        print(f"✅ Token criado: {token_obj.token}")
        print(f"   Expira em: {token_obj.expires_at}")
        
        # 4. Testar verificação do token
        print("\n4. Testando verificação do token...")
        usuario_verificado = verify_reset_token(db, token_obj.token)
        
        if not usuario_verificado:
            print("❌ Token não é válido")
            return False
        
        print(f"✅ Token válido para: {usuario_verificado.nome_completo}")
        
        # 5. Testar redefinição de senha
        print("\n5. Testando redefinição de senha...")
        nova_senha = "nova_senha_teste_123"
        success_reset = reset_user_password(db, token_obj.token, nova_senha)
        
        if not success_reset:
            print("❌ Falha na redefinição de senha")
            return False
        
        print("✅ Senha redefinida com sucesso")
        
        # 6. Verificar se o token foi marcado como usado
        print("\n6. Verificando se token foi marcado como usado...")
        token_usado = db.query(PasswordResetToken).filter(
            PasswordResetToken.token == token_obj.token
        ).first()
        
        if token_usado and token_usado.used:
            print("✅ Token marcado como usado corretamente")
        else:
            print("❌ Token não foi marcado como usado")
        
        print("\n" + "=" * 50)
        print("🎉 TESTE CONCLUÍDO COM SUCESSO!")
        print("   A funcionalidade de recuperação de senha está funcionando corretamente.")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro durante o teste: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_password_reset())
