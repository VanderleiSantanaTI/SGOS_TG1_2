# 🔍 Debug - Ordens de Serviço Não Aparecem

## 🎯 Possíveis Causas

### 1. **Problema de CORS**
- Frontend (http://localhost:8100) → Backend (http://localhost:8000)
- Navegador bloqueia requisições cross-origin

### 2. **Problema de Autenticação**
- Token JWT não está sendo enviado corretamente
- Token expirado ou inválido

### 3. **Problema de Estrutura da Resposta**
- Frontend esperando formato diferente do backend

---

## 🧪 Como Debugar

### **1. Abrir Console do Navegador**
```bash
# No navegador (F12):
1. Vá para "Ordens de Serviço"
2. Abra Console (F12)
3. Veja os logs:
   - "OS Response: ..."
   - "Loaded OS: ..."
   - Erros de CORS ou autenticação
```

### **2. Verificar Network Tab**
```bash
# No navegador (F12 → Network):
1. Vá para "Ordens de Serviço"
2. Veja se aparece requisição para:
   - GET /api/v1/ordens-servico/
3. Verifique:
   - Status: 200 OK ou erro?
   - Headers: Authorization presente?
   - Response: Dados corretos?
```

### **3. Verificar Token**
```javascript
// No console do navegador:
localStorage.getItem('sgos_token')
localStorage.getItem('sgos_user')

// Deve mostrar:
// Token: "eyJhbGciOiJIUzI1NiIs..."
// User: {"id":1,"username":"admin"...}
```

---

## 🔧 Possíveis Soluções

### **Solução 1: Configurar CORS no Backend**
```python
# No backend/main.py, verificar se tem:
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8100"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **Solução 2: Usar Proxy do Ionic**
```bash
# Já configurado no ionic.config.json:
{
  "proxies": [{
    "path": "/api/*",
    "proxyUrl": "http://localhost:8000/api/*"
  }]
}

# Mudar URL no frontend para:
# '/api/v1/ordens-servico/' ao invés de 'http://localhost:8000/api/v1/ordens-servico/'
```

### **Solução 3: Verificar Resposta da API**
```bash
# Testar diretamente:
curl -X GET "http://localhost:8000/api/v1/ordens-servico/" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🚀 Correção Rápida

Vou implementar uma correção usando o proxy do Ionic:
