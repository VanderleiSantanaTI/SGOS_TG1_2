# 🚀 Como Executar o SGOS Frontend

## 📋 Pré-requisitos

Certifique-se de ter instalado:

```bash
# Node.js 16 ou superior
node --version

# npm (vem com o Node.js)
npm --version

# Ionic CLI (instalar globalmente)
npm install -g @ionic/cli
```

## ⚡ Execução Rápida

### 1. Instalar Dependências
```bash
cd frontend
npm install
```

### 2. Executar o App
```bash
ionic serve
```

### 3. Acessar
- **URL:** http://localhost:8100
- **Backend deve estar rodando em:** http://localhost:8000

## 🔐 Login de Teste

Use os botões de **Login Rápido** na tela de login ou digite manualmente:

### Credenciais Disponíveis:
- **Admin:** `admin` / `admin123`
- **Supervisor:** `supervisor` / `supervisor123`
- **Mecânico:** `mecanico1` / `mecanico123`
- **Usuário:** `usuario` / `usuario123`

## 📱 Visualização Responsiva

```bash
# Ver em modo laboratório (iOS/Android/Desktop)
ionic serve --lab

# Acesso via rede local (para testar em celular)
ionic serve --host=0.0.0.0
```

## 🛠️ Desenvolvimento

### Comandos Úteis:
```bash
# Executar com live reload
ionic serve

# Build para produção
ionic build --prod

# Executar testes
npm test

# Verificar lint
npm run lint
```

## 🐛 Solução de Problemas

### Erro de CORS:
Se houver erro de CORS, certifique-se que:
1. O backend está rodando em `http://localhost:8000`
2. O CORS está configurado no backend para aceitar `http://localhost:8100`

### Erro de Dependências:
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro de Proxy:
O arquivo `ionic.config.json` já está configurado com proxy para o backend.

## 📱 Teste em Dispositivo Móvel

### Na mesma rede WiFi:
```bash
# Descobrir seu IP local
ipconfig  # Windows
ifconfig  # Mac/Linux

# Executar com IP específico
ionic serve --host=SEU_IP_LOCAL

# Exemplo: ionic serve --host=192.168.1.100
```

Depois acesse no celular: `http://SEU_IP_LOCAL:8100`

## 🎯 Próximos Passos

1. ✅ **Login funcionando** - Teste com as credenciais acima
2. ✅ **Dashboard responsivo** - Funciona em mobile e desktop
3. ✅ **Menu lateral** - Navegação completa
4. 🔄 **Páginas específicas** - Serão implementadas conforme necessário

## 📞 Suporte

Se houver problemas:
1. Verifique se o backend está rodando
2. Confirme se as credenciais estão corretas
3. Verifique o console do navegador para erros
4. Teste a conectividade com a API

---

**🎉 O app está pronto para uso! Faça login e explore o sistema!**
