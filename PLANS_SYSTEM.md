# Sistema de Planos - Gratuito vs Premium

## 📋 Visão Geral

O sistema agora suporta dois tipos de planos:

### 🆓 **Plano Gratuito**
- **Limite**: 5 requisições totais
- **Recursos**: Chat, Quiz, Avaliação de Questões, Mapas Mentais
- **Preço**: Grátis

### ⭐ **Plano Premium**
- **Limite**: Requisições ilimitadas
- **Recursos**: Todos os recursos do plano gratuito + Suporte prioritário
- **Preço**: Pago (futura integração com Stripe)

## 🔧 Como Funciona

### 1. **Controle de Requisições**
- Cada requisição para IA incrementa o contador (`requests_used`)
- Usuários gratuitos são bloqueados após 5 requisições
- Usuários premium têm acesso ilimitado

### 2. **Validação Automática**
- Antes de cada requisição, o sistema verifica:
  - Se o usuário existe
  - Se pode fazer requisição (baseado no plano)
  - Se a assinatura está ativa (para premium)

### 3. **Gestão de Assinaturas**
- Usuários premium têm data de expiração
- Sistema verifica automaticamente se a assinatura expirou
- Downgrade automático para gratuito quando expira

## 🗄️ Estrutura do Banco

### Tabela `users` atualizada:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  plan_type VARCHAR(20) DEFAULT 'free' CHECK (plan_type IN ('free', 'premium')),
  requests_used INTEGER DEFAULT 0,
  stripe_customer_id VARCHAR(255),
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Endpoints Disponíveis

### **Consultar Planos**
```bash
# Ver todos os planos
GET /plans

# Ver plano gratuito
GET /plans/free

# Ver plano premium
GET /plans/premium
```

### **Gestão de Usuário**
```bash
# Ver plano do usuário
GET /plans/user/:userId

# Verificar se pode fazer requisição
GET /plans/user/:userId/can-request

# Verificar status da assinatura
GET /plans/user/:userId/status
```

### **Upgrade/Downgrade**
```bash
# Fazer upgrade para premium
POST /plans/user/:userId/upgrade
{
  "stripeCustomerId": "cus_123456789"
}

# Fazer downgrade para gratuito
POST /plans/user/:userId/downgrade

# Resetar contador de requisições
POST /plans/user/:userId/reset-requests
```

## 📊 Exemplos de Resposta

### **Plano do Usuário**
```json
{
  "userPlan": {
    "id": "user-uuid",
    "email": "joao@exemplo.com",
    "name": "João Silva",
    "planType": "free",
    "requestsUsed": 3,
    "maxRequests": 5,
    "features": ["chat", "quiz", "question_evaluation", "mindmap"],
    "subscriptionStatus": "inactive",
    "subscriptionEndDate": null,
    "canMakeRequest": true
  }
}
```

### **Plano Premium**
```json
{
  "userPlan": {
    "planType": "premium",
    "requestsUsed": 15,
    "maxRequests": -1,
    "features": ["chat", "quiz", "question_evaluation", "mindmap", "priority_support"],
    "subscriptionStatus": "active",
    "subscriptionEndDate": "2024-02-15T10:00:00Z",
    "canMakeRequest": true
  }
}
```

## 🔄 Fluxo de Uso

### **Usuário Gratuito**
1. Cria conta → Plano gratuito (5 requisições)
2. Faz requisições → Contador incrementa
3. Atinge limite → Bloqueado
4. Opção: Upgrade para premium

### **Usuário Premium**
1. Faz upgrade → Plano premium (ilimitado)
2. Faz requisições → Sem limite
3. Assinatura expira → Downgrade automático

## 🛡️ Validações Implementadas

- ✅ **Limite de requisições** para usuários gratuitos
- ✅ **Verificação de assinatura** para usuários premium
- ✅ **Downgrade automático** quando assinatura expira
- ✅ **Controle de acesso** baseado no plano
- ✅ **Preparação para Stripe** (campos já criados)

## 🔮 Preparação para Stripe

O sistema está preparado para integração futura com Stripe:

- Campo `stripe_customer_id` para identificar cliente
- Campo `subscription_status` para status da assinatura
- Campo `subscription_end_date` para controle de expiração
- Endpoint de upgrade já aceita `stripeCustomerId`

## 🧪 Testes

Use o arquivo `teste.http` para testar:

1. **Criar usuário** → `POST /users`
2. **Verificar plano** → `GET /plans/user/:userId`
3. **Fazer requisições** → `POST /chat` (com userId)
4. **Testar limite** → Fazer 6 requisições
5. **Fazer upgrade** → `POST /plans/user/:userId/upgrade`
6. **Testar ilimitado** → Fazer mais requisições

## 💡 Dicas de Implementação

1. **Frontend**: Mostrar contador de requisições restantes
2. **UX**: Alertar quando próximo do limite
3. **Monetização**: Oferecer upgrade quando atingir limite
4. **Analytics**: Rastrear conversões de gratuitos para premium 