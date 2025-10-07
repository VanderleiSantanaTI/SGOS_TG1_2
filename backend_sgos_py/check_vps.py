#!/usr/bin/env python3
"""
Script para verificar status da VPS
"""

import requests
import json
from datetime import datetime

def check_vps_status():
    """Verifica status detalhado da VPS"""
    print("🔍 Verificando Status da VPS")
    print("=" * 50)
    
    base_url = "https://apitg.vsatech.cloud"
    
    # 1. Testar health check
    print("\n1️⃣ Testando Health Check...")
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ API funcionando")
            print(f"   Resposta: {response.json()}")
        else:
            print("   ❌ API com problemas")
            print(f"   Resposta: {response.text}")
    except Exception as e:
        print(f"   ❌ Erro: {e}")
    
    # 2. Testar endpoint raiz
    print("\n2️⃣ Testando Endpoint Raiz...")
    try:
        response = requests.get(f"{base_url}/", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Endpoint raiz funcionando")
            print(f"   Resposta: {response.json()}")
        else:
            print("   ❌ Endpoint raiz com problemas")
    except Exception as e:
        print(f"   ❌ Erro: {e}")
    
    # 3. Testar documentação
    print("\n3️⃣ Testando Documentação...")
    try:
        response = requests.get(f"{base_url}/docs", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Documentação acessível")
        else:
            print("   ❌ Documentação inacessível")
    except Exception as e:
        print(f"   ❌ Erro: {e}")
    
    # 4. Testar login com diferentes credenciais
    print("\n4️⃣ Testando Login...")
    
    test_credentials = [
        {"username": "admin", "password": "admin123"},
        {"username": "admin", "password": "admin"},
        {"username": "admin", "password": "123456"},
        {"username": "root", "password": "admin123"},
    ]
    
    for cred in test_credentials:
        print(f"\n   Testando: {cred['username']} / {cred['password']}")
        try:
            response = requests.post(
                f"{base_url}/api/v1/auth/login",
                json=cred,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                print("   ✅ Login bem-sucedido!")
                data = response.json()
                print(f"   Token: {data.get('data', {}).get('access_token', 'N/A')[:20]}...")
                break
            else:
                print(f"   ❌ Login falhou: {response.json().get('message', 'Erro desconhecido')}")
                
        except Exception as e:
            print(f"   ❌ Erro: {e}")
    
    # 5. Testar recuperação de senha
    print("\n5️⃣ Testando Recuperação de Senha...")
    try:
        response = requests.post(
            f"{base_url}/api/v1/auth/forgot-password",
            json={"email": "admin@test.com"},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ Recuperação funcionando")
        else:
            print(f"   ❌ Recuperação falhou: {response.json().get('message', 'Erro desconhecido')}")
            
    except Exception as e:
        print(f"   ❌ Erro: {e}")
    
    # 6. Verificar headers da resposta
    print("\n6️⃣ Verificando Headers...")
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        print("   Headers importantes:")
        for header in ['server', 'content-type', 'date', 'content-length']:
            if header in response.headers:
                print(f"   {header}: {response.headers[header]}")
    except Exception as e:
        print(f"   ❌ Erro: {e}")

def check_local_vs_vps():
    """Compara local vs VPS"""
    print("\n" + "=" * 60)
    print("🔄 COMPARAÇÃO LOCAL vs VPS")
    print("=" * 60)
    
    # Testar local
    print("\n🏠 LOCALHOST:")
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/auth/login",
            json={"username": "admin", "password": "admin123"},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Login local funcionando")
        else:
            print("   ❌ Login local com problemas")
    except Exception as e:
        print(f"   ❌ Local não acessível: {e}")
    
    # Testar VPS
    print("\n🌐 VPS:")
    try:
        response = requests.post(
            "https://apitg.vsatech.cloud/api/v1/auth/login",
            json={"username": "admin", "password": "admin123"},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Login VPS funcionando")
        else:
            print(f"   ❌ Login VPS com problemas: {response.json().get('message', 'Erro desconhecido')}")
    except Exception as e:
        print(f"   ❌ VPS não acessível: {e}")

if __name__ == "__main__":
    check_vps_status()
    check_local_vs_vps()
    
    print("\n" + "=" * 60)
    print("📋 RESUMO")
    print("=" * 60)
    print("Se o login local funciona mas o VPS não:")
    print("1. Verificar se usuário admin existe na VPS")
    print("2. Verificar se banco de dados está sincronizado")
    print("3. Verificar se código está atualizado na VPS")
    print("4. Verificar logs da VPS: docker-compose logs")
