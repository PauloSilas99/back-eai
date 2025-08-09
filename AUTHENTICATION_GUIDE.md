# Guia de Autenticação e Sistema de Usuários

## Visão Geral

O sistema foi atualizado para incluir autenticação completa com JWT, validação de dados e controle de limites de requisições baseado no tipo de plano do usuário.

## Novas Funcionalidades

### 1. Autenticação
- **Registro**: Criar conta com nome, email e senha
- **Login**: Acessar conta existente com email e senha
- **JWT**: Tokens de autenticação válidos por 7 dias

### 2. Validação de Dados
- Validação de email único
- Validação de senha (mínimo 6 caracteres)
- Validação de nome (mínimo 2 caracteres)

### 3. Sistema de Planos
- **Plano Gratuito**: 10 requisições por mês
- **Plano Premium**: Requisições ilimitadas

## Endpoints de Autenticação

### POST /auth/register
Registrar novo usuário.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "planType": "free",
    "requestsUsed": 0,
    "maxRequests": 10
  },
  "token": "jwt_token_aqui"
}
```

### POST /auth/login
Fazer login com conta existente.

**Body:**
```json
{
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "planType": "free",
    "requestsUsed": 5,
    "maxRequests": 10
  },
  "token": "jwt_token_aqui"
}
```

## Endpoints Protegidos

Todos os endpoints de IA e usuários agora requerem autenticação. Inclua o token JWT no header:

```
Authorization: Bearer seu_jwt_token_aqui
```

### Endpoints de IA (Protegidos)
- `POST /chat` - Chat com IA
- `POST /chat/quiz` - Gerar quiz
- `POST /chat/questao` - Avaliar resposta
- `POST /chat/mindmap` - Gerar mapa mental
- `GET /chat/history` - Histórico de chats
- `GET /chat/quiz/history` - Histórico de quizzes
- `GET /chat/mindmap/history` - Histórico de mapas mentais

### Endpoints de Usuários (Protegidos)
- `GET /users` - Listar todos os usuários
- `GET /users/:id` - Buscar usuário por ID
- `GET /users/email/:email` - Buscar usuário por email
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário
- `GET /users/:id/stats` - Estatísticas do usuário
- `POST /users/:id/upgrade` - Fazer upgrade para premium
- `GET /users/:id/limits` - Verificar limites de requisições

## Controle de Limites

### Verificar Limites
```bash
GET /users/:id/limits
Authorization: Bearer seu_token
```

**Response:**
```json
{
  "planType": "free",
  "requestsUsed": 5,
  "maxRequests": 10,
  "remainingRequests": 5,
  "canMakeRequests": true
}
```

### Upgrade para Premium
```bash
POST /users/:id/upgrade
Authorization: Bearer seu_token
```

**Response:**
```json
{
  "message": "Upgrade para premium realizado com sucesso",
  "user": {
    "id": "uuid",
    "plan_type": "premium",
    "max_requests": 999999
  }
}
```

## Migração do Supabase

Execute o script `ADD_PASSWORD_COLUMN.sql` no Editor SQL do Supabase para adicionar as novas colunas sem quebrar a estrutura existente:

1. Acesse o painel do Supabase
2. Vá para "SQL Editor"
3. Execute o script `ADD_PASSWORD_COLUMN.sql`
4. Verifique se as colunas foram adicionadas corretamente

### Colunas Adicionadas
- `password_hash`: Hash da senha do usuário
- `max_requests`: Limite máximo de requisições baseado no plano

### Triggers Criados
- `trigger_set_user_limits`: Define automaticamente os limites baseados no tipo de plano

## Tratamento de Usuários Existentes

Usuários criados antes da implementação de senhas:
1. Não conseguirão fazer login até redefinirem a senha
2. Receberão erro: "Conta criada antes da implementação de senhas. Por favor, redefina sua senha."
3. Precisarão usar o endpoint de atualização de usuário para definir uma senha

## Variáveis de Ambiente

Adicione ao seu `.env`:

```env
JWT_SECRET=sua_chave_secreta_muito_segura
GOOGLE_API_KEY=sua_chave_api_google
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_supabase
```

## Exemplo de Uso Completo

### 1. Registrar usuário
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva",
    "email": "maria@exemplo.com",
    "password": "senha123"
  }'
```

### 2. Fazer login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@exemplo.com",
    "password": "senha123"
  }'
```

### 3. Usar serviço de IA
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token_aqui" \
  -d '{
    "prompt": "Explique o que é inteligência artificial"
  }'
```

### 4. Verificar limites
```bash
curl -X GET http://localhost:3000/users/seu_user_id/limits \
  -H "Authorization: Bearer seu_token_aqui"
```

## Segurança

- Senhas são hasheadas com bcrypt (12 rounds)
- Tokens JWT expiram em 7 dias
- Validação de dados em todos os endpoints
- Controle de acesso baseado em autenticação
- Limites de requisições para usuários gratuitos 