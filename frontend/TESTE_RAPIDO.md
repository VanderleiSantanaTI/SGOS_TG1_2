# 🚀 Teste Rápido - SGOS Frontend

## ✅ **Correções Aplicadas**

**URLs corrigidas para usar porta 8000:**
- ✅ Login: `http://localhost:8000/api/v1/auth/login`
- ✅ OS: `http://localhost:8000/api/v1/ordens-servico/`
- ✅ Veículos: `http://localhost:8000/api/v1/veiculos/`

**Logs de debug adicionados:**
- ✅ Console mostra resposta da API
- ✅ Contadores de dados carregados
- ✅ Identificação de erros específicos

---

## 🧪 **Teste Imediato**

### **1. Verificar Ordens de Serviço:**
1. **Acesse:** http://localhost:8100
2. **Login:** Botão "Admin"
3. **Menu:** "Ordens de Serviço"
4. **Console:** F12 → Console
5. **Verificar logs:**
   ```
   OS Response: {status: "success", data: {items: [...]}}
   Loaded OS: 19
   ```

### **2. Se Funcionar:**
- ✅ **Deve mostrar 19 OS** na lista
- ✅ **Cards com dados reais** do backend
- ✅ **Filtros funcionando**
- ✅ **Botão [+] para criar**

### **3. Teste de Criação:**
1. **Clique [+]** (header ou FAB)
2. **Preencha:**
   - Veículo: Selecione da lista
   - Hodômetro: 50000
   - Problema: "Teste de criação"
   - Sistema: "Motor"
   - Causa: "Teste do frontend"
   - Tipo: "Preventiva"
3. **Clique "Criar"**
4. **Deve aparecer** na lista

---

## 🔍 **Se Ainda Não Funcionar**

### **Debug no Console:**
```javascript
// No console do navegador (F12):

// 1. Verificar se backend responde
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(data => console.log('Backend health:', data))

// 2. Testar login manual
fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'admin', password: 'admin123'})
})
.then(r => r.json())
.then(data => console.log('Manual login:', data))

// 3. Testar OS com token
const token = localStorage.getItem('sgos_token');
fetch('http://localhost:8000/api/v1/ordens-servico/', {
  headers: {'Authorization': 'Bearer ' + token}
})
.then(r => r.json())
.then(data => console.log('Manual OS fetch:', data))
```

---

## 🎯 **Dados Esperados**

### **Backend tem 19 OS:**
- OS #1: RETIRADA - Barulho no motor...
- OS #2: RETIRADA - Vazamento de óleo...
- OS #3: FECHADA - Troca de óleo...
- ... e mais 16 ordens

### **Estatísticas Esperadas:**
- 📊 **Total:** 19
- ⚠️ **Abertas:** ~12
- ✅ **Fechadas:** ~6  
- 🚗 **Retiradas:** ~1

---

## ✅ **Status Atual**

**✅ Backend:** Rodando na porta 8000  
**✅ CORS:** Configurado para aceitar frontend  
**✅ URLs:** Corrigidas para porta 8000  
**✅ Logs:** Debug adicionado  
**✅ Autenticação:** JWT funcionando  

**🎉 Agora deve funcionar! Teste e veja os logs no console para confirmar que os dados estão sendo carregados.**
