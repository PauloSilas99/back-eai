# Configuração no Render

## 🔧 Variáveis de Ambiente no Render

### **Passo a Passo:**

1. **Acesse o Dashboard do Render**
   - Vá para [dashboard.render.com](https://dashboard.render.com)
   - Faça login na sua conta

2. **Encontre seu serviço**
   - Clique no seu serviço backend
   - Vá para a aba **"Environment"**

3. **Adicione as variáveis de ambiente:**

```env
# Google Gemini AI (já deve existir)
GOOGLE_API_KEY=sua_chave_api_do_google_aqui

# Supabase (NOVAS - adicione estas)
SUPABASE_URL=https://dldwibszecjywwymboeg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZHdpYnN6ZWNqeXd3eW1ib2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MDMxOTUsImV4cCI6MjA3MDI3OTE5NX0.xLrYAg9BS2QTTJmyLje6z4cvZDNyHLSwEqWeZdTeuWM

# Porta (opcional)
PORT=3000
```

4. **Salve as configurações**
   - Clique em **"Save Changes"**
   - O Render irá fazer um novo deploy automaticamente

### **⚠️ Importante:**
- Após adicionar as variáveis, o Render fará um **redeploy automático**
- Aguarde alguns minutos para o deploy terminar
- Teste os endpoints para verificar se está funcionando

## 🧪 Teste após o Deploy

Use o arquivo `teste.http` atualizado para testar:

```bash
# Teste básico
curl https://seu-backend.onrender.com/

# Teste de usuários
curl -X POST https://seu-backend.onrender.com/users \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@exemplo.com", "name": "Usuário Teste"}'
``` 