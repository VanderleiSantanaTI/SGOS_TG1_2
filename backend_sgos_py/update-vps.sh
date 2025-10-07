#!/bin/bash

# Script para atualizar dependências na VPS
echo "🔄 Atualizando dependências na VPS..."

# Parar aplicação
echo "⏹️ Parando aplicação..."
docker-compose down

# Atualizar dependências
echo "📦 Atualizando dependências..."
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall

# Limpar cache
echo "🧹 Limpando cache..."
pip cache purge

# Reconstruir container
echo "🔨 Reconstruindo container..."
docker-compose build --no-cache

# Iniciar aplicação
echo "🚀 Iniciando aplicação..."
docker-compose up -d

echo "✅ Atualização concluída!"
echo "📋 Verificar logs: docker-compose logs -f"
