# Configuração de Email para SGOS

## Como configurar sua conta Gmail pessoal para envio de emails

### 1. Ativar Autenticação de 2 Fatores no Gmail

1. Acesse sua conta Google
2. Vá em "Segurança"
3. Ative a "Verificação em duas etapas"

### 2. Gerar Senha de App

1. Com a verificação em duas etapas ativada, vá em "Senhas de app"
2. Selecione "Email" como tipo de app
3. Clique em "Gerar"
4. **Copie a senha gerada** (16 caracteres sem espaços)

### 3. Configurar as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes configurações:

```env
# Configurações de Email
MAIL_USERNAME=seu_email@gmail.com
MAIL_PASSWORD=sua_senha_de_app_gerada
MAIL_FROM=seu_email@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_FROM_NAME=SGOS - Sistema de Gerenciamento
```

### 4. Exemplo de Configuração

Se seu email for `joao.silva@gmail.com` e a senha de app for `abcd efgh ijkl mnop`, o arquivo `.env` ficaria assim:

```env
MAIL_USERNAME=joao.silva@gmail.com
MAIL_PASSWORD=abcdefghijklmnop
MAIL_FROM=joao.silva@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_FROM_NAME=SGOS - Sistema de Gerenciamento
```

### 5. Testando a Configuração

Após configurar, você pode testar o envio de email usando a rota de recuperação de senha:

```
POST /auth/forgot-password
{
    "email": "email_para_testar@exemplo.com"
}
```

### 6. Solução de Problemas

#### Erro: "Username and Password not accepted"
- Verifique se a verificação em duas etapas está ativada
- Confirme se está usando a senha de app (não a senha normal)
- Certifique-se de que a senha de app não tem espaços

#### Erro: "SMTP Authentication failed"
- Verifique se o email e senha estão corretos
- Confirme se o servidor SMTP está correto (smtp.gmail.com)
- Verifique se a porta está correta (587)

#### Erro: "Connection refused"
- Verifique sua conexão com a internet
- Confirme se não há firewall bloqueando a porta 587

### 7. Segurança

⚠️ **IMPORTANTE:**
- Nunca commite o arquivo `.env` no Git
- Mantenha sua senha de app segura
- Use senhas de app diferentes para cada aplicação
- Revogue senhas de app antigas regularmente

### 8. Alternativas para Produção

Para ambientes de produção, considere usar:
- SendGrid
- Amazon SES
- Mailgun
- Outros serviços de email transacional
