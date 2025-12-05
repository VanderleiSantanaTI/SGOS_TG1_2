# 📋 Análise de Uso dos Arquivos do Backend

## ✅ Arquivos USADOS pelo Sistema (Importados no Código)

### Core da Aplicação
- ✅ **main.py** - Ponto de entrada da aplicação FastAPI
- ✅ **database.py** - Configuração do banco de dados (importado em main.py, models.py, routers)
- ✅ **models.py** - Modelos SQLAlchemy (importado em main.py, routers, scripts)
- ✅ **config.py** - Configurações e variáveis de ambiente (importado em main.py, routers, scripts)
- ✅ **middleware.py** - Middleware de logging (importado em main.py)
- ✅ **schemas.py** - Schemas Pydantic para validação (importado em routers)
- ✅ **auth.py** - Funções de autenticação JWT (importado em routers)
- ✅ **email_service.py** - Serviço de envio de emails (importado em routers/auth.py)

### Routers (Todos Usados)
- ✅ **routers/auth.py** - Endpoints de autenticação
- ✅ **routers/usuarios.py** - Endpoints de usuários
- ✅ **routers/veiculos.py** - Endpoints de veículos
- ✅ **routers/ordens_servico.py** - Endpoints de ordens de serviço
- ✅ **routers/servicos_realizados.py** - Endpoints de serviços realizados
- ✅ **routers/pecas_utilizadas.py** - Endpoints de peças utilizadas
- ✅ **routers/encerrar_os.py** - Endpoints de encerramento de OS
- ✅ **routers/retirada_viatura.py** - Endpoints de retirada de viatura

### Utilitários (Todos Usados)
- ✅ **utils/response_utils.py** - Funções auxiliares de resposta (importado em routers)
- ✅ **utils/timezone_utils.py** - Funções de timezone (importado em models.py)

### Templates
- ✅ **templates/password_reset.html** - Template HTML para reset de senha (usado por email_service.py)

### Configuração
- ✅ **requirements.txt** - Dependências Python
- ✅ **docker-compose.yml** - Configuração Docker Compose
- ✅ **Dockerfile** - Configuração Docker

---

## 🔧 Arquivos UTILITÁRIOS (Scripts Standalone)

Estes arquivos são executados manualmente quando necessário, mas NÃO são importados pelo sistema principal:

- 🔧 **check_vps.py** - Script para verificar status da VPS em produção
  - Uso: `python check_vps.py`
  - Função: Testa endpoints da API na VPS

- 🔧 **create_env.py** - Script para criar arquivo .env automaticamente
  - Uso: `python create_env.py`
  - Função: Gera arquivo .env com configurações padrão

- 🔧 **database_init.py** - Script para inicializar banco de dados
  - Uso: `python database_init.py`
  - Função: Cria tabelas e insere dados iniciais (admin, veículos exemplo)

- 🔧 **recreate_admin.py** - Script para recriar usuário admin
  - Uso: `python recreate_admin.py`
  - Função: Remove e recria usuário admin com senha padrão

- 🔧 **view_logs.py** - Script para visualizar logs do sistema
  - Uso: `python view_logs.py [opções]`
  - Função: Consulta logs da API e erros no banco de dados

---

## 🚀 Arquivos de DEPLOY

- 🚀 **force_update_vps.sh** - Script de atualização forçada na VPS
- 🚀 **update-vps.sh** - Script de atualização na VPS
- 🚀 **deploy/** - Diretório vazio (pode ser usado para scripts de deploy)

---

## 📚 Arquivos de DOCUMENTAÇÃO

- 📚 **README.md** - Documentação principal do projeto
- 📚 **CONFIGURACAO_EMAIL.md** - Documentação de configuração de email

---

## 💾 Arquivos de DADOS

- 💾 **sgos.db** - Banco de dados SQLite (gerado automaticamente)

---

## 📊 Resumo

### Total de Arquivos Analisados
- **Arquivos Python Core:** 8 arquivos (todos usados)
- **Routers:** 8 arquivos (todos usados)
- **Utils:** 2 arquivos (todos usados)
- **Scripts Utilitários:** 5 arquivos (standalone, não importados)
- **Templates:** 1 arquivo (usado)
- **Configuração:** 3 arquivos (usados)
- **Deploy:** 3 arquivos (scripts de deploy)
- **Documentação:** 2 arquivos
- **Dados:** 1 arquivo (banco SQLite)

### Conclusão

✅ **TODOS os arquivos estão sendo utilizados ou têm propósito definido:**

1. **Arquivos Core** - Essenciais para funcionamento da API
2. **Scripts Utilitários** - Úteis para manutenção e administração
3. **Arquivos de Deploy** - Necessários para deploy em produção
4. **Documentação** - Importante para desenvolvedores
5. **Banco de Dados** - Gerado automaticamente pelo sistema

### ⚠️ Observações

- O diretório `deploy/` está vazio, mas pode ser usado no futuro
- Os scripts utilitários são executados manualmente quando necessário
- Nenhum arquivo está obsoleto ou sem uso

---

**Data da Análise:** 2024
**Status:** ✅ Todos os arquivos têm propósito definido

