#!/bin/bash

# Script para forçar atualização na VPS
echo "🚀 Forçando atualização na VPS..."

# 1. Parar todos os containers
echo "⏹️ Parando containers..."
docker-compose down

# 2. Remover imagens antigas
echo "🗑️ Removendo imagens antigas..."
docker image prune -f
docker rmi $(docker images -q) 2>/dev/null || true

# 3. Atualizar código
echo "📥 Atualizando código..."
git pull origin main

# 4. Atualizar dependências
echo "📦 Atualizando dependências..."
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall --no-cache-dir

# 5. Limpar cache Python
echo "🧹 Limpando cache..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true

# 6. Reconstruir sem cache
echo "🔨 Reconstruindo containers..."
docker-compose build --no-cache --pull

# 7. Iniciar aplicação
echo "🚀 Iniciando aplicação..."
docker-compose up -d

# 8. Verificar status
echo "📊 Verificando status..."
sleep 10
docker-compose ps

# 9. Mostrar logs
echo "📋 Logs recentes:"
docker-compose logs --tail=20

echo "✅ Atualização forçada concluída!"
echo "🔍 Para ver logs em tempo real: docker-compose logs -f"
