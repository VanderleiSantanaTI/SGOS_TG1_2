# 🧪 Como Testar a Página de Veículos

## 🎯 Teste Rápido

### 1. **Acesso**
- ✅ App rodando em: http://localhost:8100
- ✅ Backend rodando em: http://localhost:8000
- ✅ Faça login e vá para "Veículos" no menu

### 2. **Teste por Perfil**

#### 👑 **Como ADMIN** (`admin` / `admin123`)
1. **Login** → Menu → **Veículos**
2. **Deve ver:**
   - ✅ Botão [+] no header (desktop)
   - ✅ FAB button [+] no canto (mobile)
   - ✅ Lista de veículos com dados reais
   - ✅ Botões "Editar" e "Excluir" em cada card
   - ✅ Filtros de busca e status

3. **Teste Funcionalidades:**
   - ✅ **Busca:** Digite "Toyota" ou "ABC"
   - ✅ **Filtro Status:** Selecione "Ativo"
   - ✅ **Criar:** Clique no [+] (mostra modal temporário)
   - ✅ **Editar:** Clique "Editar" em um card
   - ✅ **Excluir:** Clique "Excluir" (confirma exclusão)

#### 👥 **Como SUPERVISOR** (`supervisor` / `supervisor123`)
1. **Login** → Menu → **Veículos**
2. **Deve ver:**
   - ❌ **Sem** botão [+] no header
   - ❌ **Sem** FAB button
   - ✅ Lista de veículos
   - ✅ Apenas botão "Editar" (sem "Excluir")

#### 🔧 **Como MECÂNICO** (`mecanico1` / `mecanico123`)
1. **Login** → Menu → **Veículos**
2. **Deve ver:**
   - ❌ **Sem** botões de ação
   - ✅ **Apenas visualização** da lista
   - ✅ Filtros funcionando normalmente

### 3. **Teste Responsivo**

#### 📱 **Mobile** (redimensione < 768px)
- ✅ Cards empilhados em 1 coluna
- ✅ FAB button no canto inferior direito (se admin)
- ✅ Filtros em layout vertical
- ✅ Touch-friendly buttons

#### 💻 **Desktop** (> 1024px)
- ✅ Grid de 3-4 colunas
- ✅ Botão [+] no header
- ✅ Filtros em linha horizontal
- ✅ Hover effects nos cards

---

## 📊 Dados Esperados

### **Veículos do Backend:**
Baseado no `database_init.py`, você deve ver:

1. **Toyota Hilux** - ABC-1224 - PAT001 - ✅ Ativo
2. **Ford Ranger** - DEF-5678 - PAT002 - ⚠️ Manutenção  
3. **Chevrolet S10** - GHI-9012 - PAT003 - ✅ Ativo
4. **Mitsubishi L200** - JKL-3456 - PAT004 - ⚠️ Manutenção
5. **Nissan Frontier** - MNO-7890 - PAT005 - ✅ Ativo

### **Estatísticas Esperadas:**
- 📊 **Total:** ~13 veículos
- ✅ **Ativos:** ~8-10 veículos
- ⚠️ **Manutenção:** ~2-3 veículos
- ❌ **Inativos:** ~0-1 veículos

---

## 🔍 Debug

### **Se não carregar veículos:**
1. **Verifique o backend:** http://localhost:8000/health
2. **Console do navegador:** F12 → Console → Veja erros
3. **Network tab:** F12 → Network → Veja se `/veiculos/` retorna 200
4. **Token:** Verifique se está no localStorage

### **Se não mostrar botões de admin:**
1. **Verifique login:** Console → `localStorage.getItem('sgos_user')`
2. **Perfil correto:** Deve mostrar `"perfil": "ADMIN"`
3. **Re-login:** Faça logout e login novamente

### **Comandos de Debug:**
```javascript
// No console do navegador:
localStorage.getItem('sgos_token')     // Ver token
localStorage.getItem('sgos_user')      // Ver dados do usuário
JSON.parse(localStorage.getItem('sgos_user')).perfil  // Ver perfil
```

---

## ✅ **Checklist de Teste**

### **Funcionalidades Básicas:**
- [ ] Login funciona
- [ ] Página carrega sem erros
- [ ] Lista de veículos aparece
- [ ] Filtros funcionam
- [ ] Estatísticas corretas

### **Permissões por Perfil:**
- [ ] **Admin:** Vê todos os botões
- [ ] **Supervisor:** Vê apenas "Editar"
- [ ] **Mecânico:** Apenas visualização
- [ ] **Usuário:** Apenas visualização

### **Responsividade:**
- [ ] **Mobile:** Layout vertical, FAB button
- [ ] **Desktop:** Grid horizontal, botão header
- [ ] **Resize:** Adaptação automática

### **Interações:**
- [ ] **Busca:** Filtra em tempo real
- [ ] **Status Filter:** Funciona corretamente
- [ ] **Pull-to-refresh:** Atualiza dados
- [ ] **Cards:** Hover effects (desktop)

---

**🎉 Se todos os itens funcionarem, a página de veículos está 100% operacional!**
