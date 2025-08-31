# 🚗 SGOS - Sistema de Gerenciamento de Ordem de Serviço

Sistema completo para gerenciamento de ordens de serviço de veículos, desenvolvido em FastAPI com banco de dados SQLite.

## 📋 Descrição

O SGOS é uma API RESTful que permite gerenciar ordens de serviço de veículos, incluindo:
- Cadastro de usuários e veículos
- Criação e acompanhamento de ordens de serviço
- Registro de serviços realizados e peças utilizadas
- Encerramento de ordens de serviço
- Retirada de viatura
- Relatórios e consultas

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
pip install -r requirements.txt
```

### 2. Popular o Banco de Dados
```bash
python populate_database.py
```

### 3. Executar o Sistema
```bash
python main.py
```

### 4. Acessar a API
- **URL Principal:** http://localhost:8000
- **Documentação Swagger:** http://localhost:8000/docs
- **Documentação ReDoc:** http://localhost:8000/redoc
- **Verificação de Saúde:** http://localhost:8000/health

## 🔑 Credenciais de Login

### 👤 Usuário Administrador
- **Username:** `admin`
- **Senha:** `admin123`
- **Email:** `admin@sgos.com`
- **Perfil:** `ADMIN`

### 👥 Outros Usuários
- **Username:** `mecanico1`, **Senha:** `mecanico123`, **Perfil:** `MECANICO`
- **Username:** `mecanico2`, **Senha:** `mecanico123`, **Perfil:** `MECANICO`
- **Username:** `supervisor`, **Senha:** `supervisor123`, **Perfil:** `SUPERVISOR`
- **Username:** `usuario`, **Senha:** `usuario123`, **Perfil:** `USUARIO`

## 📊 Módulos do Sistema

### 🔐 Autenticação (`/api/v1/auth`)
- Login de usuários
- Recuperação de senha
- Geração de tokens JWT

### 👥 Usuários (`/api/v1/usuarios`)
- Cadastro de usuários
- Gerenciamento de perfis
- Ativação/desativação de usuários

### 🚗 Veículos (`/api/v1/veiculos`)
- Cadastro de veículos
- Consulta por placa, patrimônio, marca, modelo
- Atualização de status
- Relatórios de retirada

### 📋 Ordens de Serviço (`/api/v1/ordens_servico`)
- Criação de ordens de serviço
- Acompanhamento de status
- Consultas e filtros
- Histórico de manutenções

### 🔧 Serviços Realizados (`/api/v1/servicos_realizados`)
- Registro de serviços executados
- Controle de tempo de serviço
- Relacionamento com ordens de serviço

### 🔩 Peças Utilizadas (`/api/v1/pecas_utilizadas`)
- Controle de peças utilizadas
- Número de ficha
- Quantidade utilizada

### 🔒 Encerrar OS (`/api/v1/encerrar_os`)
- Encerramento de ordens de serviço
- Registro de mecânico responsável
- Tempo total de manutenção

### 🚗 Retirada de Viatura (`/api/v1/retirada_viatura`)
- Registro de retirada de viatura
- Responsável pela retirada
- Data e hora

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais
- **usuario** - Usuários do sistema
- **veiculo** - Cadastro de veículos
- **ordem_servico** - Ordens de serviço
- **servico_realizado** - Serviços executados
- **peca_utilizada** - Peças utilizadas
- **encerrar_os** - Encerramentos de OS
- **retirada_viatura** - Retiradas de viatura
- **password_reset_token** - Tokens de recuperação de senha
- **log_erro** - Logs de erro
- **log_api** - Logs de API

## 🔧 Tecnologias Utilizadas

- **Backend:** FastAPI (Python)
- **Banco de Dados:** SQLite
- **ORM:** SQLAlchemy
- **Autenticação:** JWT (JSON Web Tokens)
- **Hash de Senhas:** bcrypt
- **Validação:** Pydantic
- **Documentação:** Swagger/OpenAPI

## 📝 Funcionalidades Principais

### ✅ Implementadas
- [x] Sistema de autenticação JWT
- [x] CRUD completo de usuários
- [x] CRUD completo de veículos
- [x] CRUD completo de ordens de serviço
- [x] Registro de serviços realizados
- [x] Controle de peças utilizadas
- [x] Encerramento de ordens de serviço
- [x] Retirada de viatura
- [x] Relatórios de retirada
- [x] Paginação e filtros
- [x] Validação de dados
- [x] Tratamento de erros
- [x] Logs de sistema
- [x] Documentação automática
- [x] Recuperação de senha por email
- [x] Envio de emails com templates HTML

### 🔄 Em Desenvolvimento
- [ ] Interface web (frontend)
- [ ] Relatórios em PDF
- [ ] Dashboard com gráficos
- [ ] Backup automático do banco

## 🛠️ Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL=sqlite:///./sgos.db

# JWT
SECRET_KEY=sua_chave_secreta_muito_segura_aqui_altere_em_producao
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email (opcional)
MAIL_USERNAME=seu_email@gmail.com
MAIL_PASSWORD=sua_senha_de_app
MAIL_FROM=seu_email@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_FROM_NAME=SGOS - Sistema de Gerenciamento
```

### 📧 Configuração de Email

Para usar sua conta Gmail pessoal para envio de emails (recuperação de senha):

1. **Ativar verificação em duas etapas** na sua conta Google
2. **Gerar senha de app**:
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "Email" como tipo de app
   - Copie a senha gerada (16 caracteres)
3. **Configurar o arquivo `.env`** com suas credenciais
4. **Testar a configuração**:
   ```bash
   python test_email.py
   ```

📖 **Guia completo:** Veja o arquivo `CONFIGURACAO_EMAIL.md` para instruções detalhadas.

## 📚 Documentação da API

A documentação completa da API está disponível em:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Endpoints Principais

#### Autenticação
- `POST /api/v1/auth/login` - Login de usuário
- `POST /api/v1/auth/forgot-password` - Recuperar senha
- `POST /api/v1/auth/reset-password` - Redefinir senha

#### Usuários
- `GET /api/v1/usuarios/` - Listar usuários
- `POST /api/v1/usuarios/` - Criar usuário
- `GET /api/v1/usuarios/{id}` - Obter usuário
- `PUT /api/v1/usuarios/{id}` - Atualizar usuário
- `DELETE /api/v1/usuarios/{id}` - Deletar usuário

#### Veículos
- `GET /api/v1/veiculos/` - Listar veículos
- `POST /api/v1/veiculos/` - Criar veículo
- `GET /api/v1/veiculos/{id}` - Obter veículo
- `PUT /api/v1/veiculos/{id}` - Atualizar veículo
- `DELETE /api/v1/veiculos/{id}` - Deletar veículo
- `GET /api/v1/veiculos/{id}/relatorio-retirada` - Relatório de retirada

#### Ordens de Serviço
- `GET /api/v1/ordens_servico/` - Listar ordens
- `POST /api/v1/ordens_servico/` - Criar ordem
- `GET /api/v1/ordens_servico/{id}` - Obter ordem
- `PUT /api/v1/ordens_servico/{id}` - Atualizar ordem
- `DELETE /api/v1/ordens_servico/{id}` - Deletar ordem

## 🚨 Segurança

- Autenticação JWT obrigatória para endpoints protegidos
- Senhas criptografadas com bcrypt
- Validação de dados com Pydantic
- CORS configurado para desenvolvimento
- Logs de auditoria para ações críticas

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação da API em `/docs`
2. Consulte os logs do sistema
3. Verifique a configuração do banco de dados

## 📄 Licença

Este projeto é de uso interno para gerenciamento de ordens de serviço de veículos.

---

**Desenvolvido com ❤️ para otimizar o gerenciamento de manutenção de veículos**
