# 📱 SGOS Frontend - Aplicativo Ionic Angular

## 🎯 Visão Geral

Este é o frontend do **SGOS (Sistema de Gerenciamento de Ordem de Serviço)**, desenvolvido com **Ionic 7** e **Angular 16**. O aplicativo é **totalmente responsivo**, funcionando perfeitamente tanto em **dispositivos móveis** quanto em **desktop**.

## ✨ Características Principais

### 📱 **Responsividade Completa**
- **Mobile-First Design**: Otimizado para dispositivos móveis
- **Desktop Ready**: Interface adaptada para telas grandes
- **Tablet Support**: Layout flexível para tablets
- **PWA Ready**: Preparado para Progressive Web App

### 🎨 **Interface Moderna**
- **Material Design**: Seguindo as diretrizes do Google
- **Dark/Light Theme**: Suporte automático a temas
- **Animações Fluidas**: Transições suaves entre telas
- **Componentes Reutilizáveis**: Arquitetura modular

### 🔐 **Segurança Avançada**
- **Autenticação JWT**: Tokens seguros
- **Guards de Rota**: Proteção baseada em roles
- **Interceptors HTTP**: Tratamento automático de erros
- **Storage Seguro**: Dados criptografados localmente

## 🏗️ Arquitetura

```
src/
├── app/
│   ├── components/          # Componentes reutilizáveis
│   ├── guards/             # Guards de autenticação/autorização
│   ├── interceptors/       # Interceptors HTTP
│   ├── models/             # Interfaces TypeScript
│   ├── pages/              # Páginas da aplicação
│   │   ├── auth/           # Páginas de autenticação
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── ordens-servico/ # Gestão de OS
│   │   ├── veiculos/       # Gestão de veículos
│   │   └── usuarios/       # Gestão de usuários
│   └── services/           # Serviços da aplicação
├── theme/                  # Temas e variáveis CSS
└── environments/           # Configurações de ambiente
```

## 🚀 Instalação e Execução

### Pré-requisitos

```bash
# Node.js 16+
node --version

# npm ou yarn
npm --version

# Ionic CLI
npm install -g @ionic/cli
```

### Instalação

```bash
# 1. Navegar para a pasta do frontend
cd frontend

# 2. Instalar dependências
npm install

# 3. Executar em desenvolvimento
ionic serve

# 4. Executar em modo específico
ionic serve --lab  # Visualizar iOS/Android/Desktop
ionic serve --host=0.0.0.0  # Acesso via rede local
```

### Builds de Produção

```bash
# Build para web
ionic build --prod

# Build para Android
ionic capacitor add android
ionic capacitor build android

# Build para iOS
ionic capacitor add ios
ionic capacitor build ios
```

## 📱 Funcionalidades por Dispositivo

### 📱 **Mobile (< 768px)**
- **Menu Lateral**: Navegação por slide menu
- **Cards Empilhados**: Layout vertical otimizado
- **Touch Gestures**: Swipe, pull-to-refresh
- **Bottom Sheets**: Ações contextuais
- **Floating Action Button**: Ações rápidas

### 💻 **Desktop (> 1024px)**
- **Sidebar Fixa**: Navegação sempre visível
- **Grid Layout**: Aproveitamento de espaço horizontal
- **Hover States**: Feedback visual aprimorado
- **Keyboard Shortcuts**: Navegação por teclado
- **Multi-column Forms**: Formulários otimizados

### 📟 **Tablet (768px - 1023px)**
- **Layout Híbrido**: Melhor dos dois mundos
- **Grid Adaptativo**: 2-3 colunas conforme espaço
- **Touch + Mouse**: Suporte a ambos inputs

## 🎨 Sistema de Design

### 🎨 **Cores Principais**
```scss
--sgos-primary: #1565c0;      // Azul principal
--sgos-secondary: #388e3c;    // Verde secundário
--sgos-accent: #ff7043;       // Laranja destaque
--sgos-success: #2dd36f;      // Verde sucesso
--sgos-warning: #ffc409;      // Amarelo aviso
--sgos-danger: #eb445a;       // Vermelho erro
```

### 📐 **Breakpoints Responsivos**
```scss
--mobile-max: 767px;          // Mobile
--tablet-min: 768px;          // Tablet início
--tablet-max: 1023px;         // Tablet fim
--desktop-min: 1024px;        // Desktop início
--large-desktop-min: 1440px;  // Desktop grande
```

### 🔧 **Utilitários CSS**
```scss
.mobile-only     // Visível apenas em mobile
.desktop-only    // Visível apenas em desktop
.tablet-only     // Visível apenas em tablet
.responsive-grid // Grid que se adapta
.responsive-card // Cards responsivos
```

## 🔐 Sistema de Autenticação

### 🔑 **Fluxo de Login**
1. **Formulário de Login**: Validação reativa
2. **Autenticação JWT**: Token seguro do backend
3. **Storage Local**: Persistência da sessão
4. **Auto-logout**: Expiração automática de token

### 👥 **Níveis de Acesso**
- **ADMIN**: Acesso total ao sistema
- **SUPERVISOR**: Gerenciamento de OS e relatórios
- **MECANICO**: Execução de serviços
- **USUARIO**: Criação de OS básicas

### 🛡️ **Proteções Implementadas**
- **AuthGuard**: Protege rotas autenticadas
- **RoleGuard**: Controla acesso por perfil
- **NoAuthGuard**: Redireciona usuários logados
- **Token Interceptor**: Adiciona token automaticamente

## 📄 Páginas Principais

### 🏠 **Dashboard**
- **Visão Geral**: Cards com estatísticas
- **OS Recentes**: Lista das últimas ordens
- **Gráficos**: Visualização de dados
- **Ações Rápidas**: Botões para funções comuns

### 🔧 **Ordens de Serviço**
- **Lista Paginada**: Com filtros e busca
- **Criação/Edição**: Formulários responsivos
- **Detalhes**: Visualização completa da OS
- **Fluxo Completo**: Abertura → Execução → Encerramento → Retirada

### 🚗 **Veículos**
- **Cadastro Completo**: Todas as informações
- **Busca Avançada**: Por placa, patrimônio, marca
- **Status Control**: Ativo, manutenção, inativo
- **Histórico**: Manutenções anteriores

### 👥 **Usuários** (Supervisor+)
- **CRUD Completo**: Criar, editar, desativar
- **Controle de Perfis**: Atribuição de roles
- **Validação**: Username e email únicos

## 🛠️ Componentes Reutilizáveis

### 📋 **Formulários**
- **Validação Reativa**: Angular Reactive Forms
- **Mensagens de Erro**: Contextuais e claras
- **Auto-save**: Salvamento automático (draft)
- **Campos Dinâmicos**: Baseados em configuração

### 📊 **Listas e Tabelas**
- **Paginação**: Scroll infinito ou paginação clássica
- **Ordenação**: Por qualquer coluna
- **Filtros**: Múltiplos critérios
- **Ações em Lote**: Seleção múltipla

### 🎨 **UI Elements**
- **Loading States**: Skeleton screens
- **Empty States**: Mensagens amigáveis
- **Error States**: Recuperação de erros
- **Success Feedback**: Confirmações visuais

## 📊 Recursos Avançados

### 🔄 **Sincronização**
- **Offline Support**: Cache local com Service Worker
- **Sync Background**: Sincronização automática
- **Conflict Resolution**: Resolução de conflitos

### 📈 **Performance**
- **Lazy Loading**: Carregamento sob demanda
- **Virtual Scrolling**: Listas grandes otimizadas
- **Image Optimization**: Carregamento inteligente
- **Bundle Splitting**: Código dividido por rota

### 🌐 **PWA Features**
- **Install Prompt**: Instalação no dispositivo
- **Push Notifications**: Notificações em tempo real
- **Background Sync**: Sincronização em background
- **Offline Fallback**: Funcionamento offline básico

## 🧪 Testes

```bash
# Testes unitários
ng test

# Testes e2e
ng e2e

# Coverage
ng test --code-coverage

# Lint
ng lint
```

## 📦 Build e Deploy

### 🌐 **Web Deploy**
```bash
# Build de produção
ionic build --prod

# Deploy para Firebase/Netlify/Vercel
# Arquivos em dist/
```

### 📱 **Mobile Deploy**
```bash
# Android
ionic capacitor build android --prod
# Gerar APK/AAB no Android Studio

# iOS
ionic capacitor build ios --prod
# Compilar no Xcode
```

### 🐳 **Docker**
```dockerfile
# Dockerfile incluído para containerização
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

## 🔧 Configuração

### 🌍 **Environments**
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
  appName: 'SGOS',
  version: '1.0.0'
};
```

### ⚙️ **Ionic Config**
```json
{
  "name": "sgos-frontend",
  "integrations": { "capacitor": {} },
  "type": "angular",
  "proxies": [{
    "path": "/api/*",
    "proxyUrl": "http://localhost:8000/api/*"
  }]
}
```

## 🎯 Próximos Passos

### 🔮 **Funcionalidades Planejadas**
- [ ] **Notificações Push**: Alertas em tempo real
- [ ] **Chat Interno**: Comunicação entre usuários
- [ ] **Relatórios PDF**: Geração de documentos
- [ ] **Dashboard Analytics**: Gráficos avançados
- [ ] **Multi-idioma**: Suporte a i18n
- [ ] **Modo Offline**: Funcionalidade completa offline

### 🚀 **Melhorias Técnicas**
- [ ] **Service Worker**: Cache inteligente
- [ ] **Web Workers**: Processamento em background
- [ ] **IndexedDB**: Storage local robusto
- [ ] **WebRTC**: Comunicação peer-to-peer
- [ ] **GraphQL**: API mais eficiente

## 📞 Suporte

### 🐛 **Debugging**
```bash
# Debug no navegador
ionic serve --devapp

# Debug no dispositivo
ionic capacitor run android -l --external
ionic capacitor run ios -l --external
```

### 📚 **Documentação**
- **Ionic Docs**: https://ionicframework.com/docs
- **Angular Docs**: https://angular.io/docs
- **Capacitor Docs**: https://capacitorjs.com/docs

---

**🎉 Desenvolvido com ❤️ usando as melhores práticas de desenvolvimento mobile e web!**
