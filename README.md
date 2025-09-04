# SGOS - Sistema de Gestão de Ordens de Serviço

Sistema completo para gestão de ordens de serviço de veículos, desenvolvido com **FastAPI** (backend) e **Angular/Ionic** (frontend).

## 🚀 Funcionalidades Principais

### 📋 Gestão de Ordens de Serviço
- ✅ **Criação** de novas ordens de serviço
- ✅ **Visualização** detalhada com modal interativa
- ✅ **Fechamento** de OS com dados do mecânico
- ✅ **Retirada** de veículos com responsável
- ✅ **Status automático** do veículo (ATIVO → MANUTENCAO → ATIVO)
- ✅ **Exportação PDF** para OS retiradas

### 🔧 Gestão de Peças e Serviços
- ✅ **Cadastro** de peças utilizadas
- ✅ **Registro** de serviços realizados
- ✅ **Filtro** por ordem de serviço
- ✅ **Cálculo automático** do tempo total
- ✅ **Validação** de campos (quantidade numérica, tempo HH:MM)

### 🚗 Gestão de Veículos
- ✅ **Cadastro** completo de veículos
- ✅ **Edição** de informações
- ✅ **Listagem** com filtros
- ✅ **Status automático** baseado no ciclo da OS
- ✅ **Validação** de placa (formato ABC-1234)

### 👥 Gestão de Usuários
- ✅ **Sistema de autenticação** JWT
- ✅ **Controle de acesso** por perfis (ADMIN, SUPERVISOR, MECANICO, USUARIO)
- ✅ **Recuperação de senha** por email
- ✅ **Gestão** de usuários (apenas SUPERVISOR+)

### 📊 Dashboard e Relatórios
- ✅ **Dashboard** com estatísticas em tempo real
- ✅ **Relatórios** de ordens de serviço
- ✅ **Filtros** avançados por data, status, veículo
- ✅ **Exportação** de dados

## 🏗️ Arquitetura

### Backend (FastAPI)
```
backend_sgos_py/
├── main.py                 # Aplicação principal
├── models.py              # Modelos SQLAlchemy
├── schemas.py             # Schemas Pydantic
├── auth.py                # Autenticação JWT
├── database.py            # Configuração do banco
├── config.py              # Configurações
├── routers/               # Endpoints da API
│   ├── auth.py
│   ├── usuarios.py
│   ├── veiculos.py
│   ├── ordens_servico.py
│   ├── pecas_utilizadas.py
│   ├── servicos_realizados.py
│   ├── encerrar_os.py
│   └── retirada_viatura.py
└── utils/                 # Utilitários
    ├── response_utils.py
    └── timezone_utils.py
```

### Frontend (Angular/Ionic)
```
frontend/src/app/
├── components/            # Componentes reutilizáveis
│   ├── app-layout/       # Layout principal
│   ├── login-form/       # Formulário de login
│   └── dashboard-stats/  # Estatísticas do dashboard
├── pages/                # Páginas da aplicação
│   ├── auth/            # Autenticação
│   ├── dashboard/       # Dashboard
│   ├── ordens-servico/  # Gestão de OS
│   ├── pecas-servicos/  # Peças e serviços
│   ├── veiculos/        # Gestão de veículos
│   ├── usuarios/        # Gestão de usuários
│   └── relatorios/      # Relatórios
├── services/            # Serviços Angular
│   ├── auth.service.ts
│   ├── api.service.ts
│   └── ...
├── guards/              # Guards de rota
├── interceptors/        # Interceptors HTTP
└── models/              # Interfaces TypeScript
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para Python
- **Pydantic** - Validação de dados
- **JWT** - Autenticação
- **SQLite/MySQL** - Banco de dados
- **Python 3.8+**

### Frontend
- **Angular 15** - Framework web
- **Ionic 6** - Framework mobile
- **TypeScript** - Linguagem tipada
- **RxJS** - Programação reativa
- **SCSS** - Estilização

## 🚀 Como Executar

### Pré-requisitos
- Python 3.8+
- Node.js 16+
- npm ou yarn

### Backend
```bash
cd backend_sgos_py
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Acesso
- **Frontend**: http://localhost:8100
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs

## 👤 Usuários Padrão

| Usuário | Senha | Perfil |
|---------|-------|--------|
| admin | admin123 | ADMIN |
| supervisor | supervisor123 | SUPERVISOR |
| mecanico1 | mecanico123 | MECANICO |
| usuario | usuario123 | USUARIO |

## 🔄 Fluxo de Status das OS

```
ABERTA → FECHADA → RETIRADA
   ↓        ↓         ↓
MANUTENCAO → MANUTENCAO → ATIVO
```

### Detalhamento:
- **ABERTA**: OS criada, veículo em manutenção
- **FECHADA**: Manutenção concluída, aguardando retirada
- **RETIRADA**: Veículo retirado, volta ao status ATIVO

## 📱 Funcionalidades Mobile

- ✅ **Design responsivo** para mobile e desktop
- ✅ **PWA** (Progressive Web App)
- ✅ **Offline support** básico
- ✅ **Touch-friendly** interface
- ✅ **Gestos** nativos do mobile

## 🔐 Segurança

- ✅ **Autenticação JWT** com refresh token
- ✅ **Controle de acesso** por perfis
- ✅ **Validação** de dados no backend
- ✅ **Sanitização** de inputs
- ✅ **CORS** configurado
- ✅ **Rate limiting** (configurável)

## 📊 Recursos Avançados

### Modal de Detalhes da OS
- ✅ **Informações completas** da ordem
- ✅ **Lista de peças** utilizadas
- ✅ **Lista de serviços** realizados
- ✅ **Informações de retirada** (quando aplicável)
- ✅ **Botões de ação** contextuais (fechar/retirar)
- ✅ **Exportação PDF** para OS retiradas

### Validações Inteligentes
- ✅ **Placa de veículo** (formato ABC-1234)
- ✅ **Quantidade** de peças (apenas números)
- ✅ **Tempo de serviço** (formato HH:MM)
- ✅ **Campos obrigatórios** com feedback visual

### Sistema de Notificações
- ✅ **Toast messages** para feedback
- ✅ **Loading states** durante operações
- ✅ **Error handling** robusto
- ✅ **Success confirmations**

## 🐳 Docker (Opcional)

O backend pode ser executado via Docker:

```bash
cd backend_sgos_py
docker-compose up -d
```

## 📈 Monitoramento

- ✅ **Logs** estruturados
- ✅ **Métricas** de performance
- ✅ **Health checks** da API
- ✅ **Error tracking** (configurável)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma [issue](https://github.com/seu-usuario/sgos/issues)
- Consulte a [documentação da API](http://localhost:8000/docs)
- Verifique os arquivos de documentação específicos em cada módulo

---

**SGOS** - Sistema completo para gestão de ordens de serviço de veículos 🚗⚙️
