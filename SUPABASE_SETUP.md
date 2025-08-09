# Configuração do Supabase

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Google Gemini AI
GOOGLE_API_KEY=sua_chave_api_do_google_aqui

# Supabase
SUPABASE_URL=sua_url_do_supabase_aqui
SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase_aqui

# Porta do servidor (opcional)
PORT=3000
```

## Configuração do Supabase

### 1. Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Anote a URL e a chave anônima do projeto

### 2. Criar Tabelas no Supabase

Execute os seguintes comandos SQL no Editor SQL do Supabase:

```sql
-- Tabela de usuários (se você não estiver usando auth.users do Supabase)
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

-- Tabela para histórico de chats
CREATE TABLE chats (
  id SERIAL PRIMARY KEY,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para histórico de quizzes
CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  quiz_data JSONB NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para histórico de mapas mentais
CREATE TABLE mindmaps (
  id SERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  mindmap_data JSONB NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para avaliações de questões
CREATE TABLE question_evaluations (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  evaluation_data JSONB NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX idx_mindmaps_user_id ON mindmaps(user_id);
CREATE INDEX idx_question_evaluations_user_id ON question_evaluations(user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Configurar Políticas de Segurança (RLS)

Para habilitar Row Level Security e configurar políticas básicas:

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_evaluations ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir todas as operações - ajuste conforme necessário)
CREATE POLICY "Allow all operations on chats" ON chats FOR ALL USING (true);
CREATE POLICY "Allow all operations on quizzes" ON quizzes FOR ALL USING (true);
CREATE POLICY "Allow all operations on mindmaps" ON mindmaps FOR ALL USING (true);
CREATE POLICY "Allow all operations on question_evaluations" ON question_evaluations FOR ALL USING (true);
```

## Novos Endpoints Disponíveis

### Endpoints de Usuários
- `POST /users` - Criar novo usuário
- `GET /users` - Listar todos os usuários
- `GET /users/:id` - Buscar usuário por ID
- `GET /users/email/:email` - Buscar usuário por email
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário
- `GET /users/:id/stats` - Estatísticas do usuário

### Endpoints de Planos
- `GET /plans` - Ver todos os planos disponíveis
- `GET /plans/free` - Ver detalhes do plano gratuito
- `GET /plans/premium` - Ver detalhes do plano premium
- `GET /plans/user/:userId` - Ver plano atual do usuário
- `GET /plans/user/:userId/status` - Verificar status da assinatura
- `GET /plans/user/:userId/can-request` - Verificar se pode fazer requisição
- `POST /plans/user/:userId/upgrade` - Fazer upgrade para premium
- `POST /plans/user/:userId/downgrade` - Fazer downgrade para gratuito
- `POST /plans/user/:userId/reset-requests` - Resetar contador de requisições

### Endpoints de IA (atualizados)
- `POST /chat` - Agora aceita `userId` opcional (valida se usuário existe e verifica limite de requisições)
- `POST /chat/quiz` - Agora aceita `userId` opcional (valida se usuário existe e verifica limite de requisições)
- `POST /chat/questao` - Agora aceita `userId` opcional (valida se usuário existe e verifica limite de requisições)
- `POST /chat/mindmap` - Agora aceita `userId` opcional (valida se usuário existe e verifica limite de requisições)

### Endpoints de Histórico
- `GET /chat/history?userId=123` - Histórico de chats
- `GET /chat/quiz/history?userId=123` - Histórico de quizzes
- `GET /chat/mindmap/history?userId=123` - Histórico de mapas mentais

## Exemplo de Uso

```bash
# Criar usuário
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email": "joao@exemplo.com", "name": "João Silva"}'

# Chat com usuário válido
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explique o que é JavaScript", "userId": "USER_ID_AQUI"}'

# Buscar histórico de chats
curl "http://localhost:3000/chat/history?userId=USER_ID_AQUI"

# Buscar estatísticas do usuário
curl "http://localhost:3000/users/USER_ID_AQUI/stats"
```

## Fluxo de Uso Recomendado

1. **Criar usuário**: `POST /users`
2. **Usar o ID retornado** em todas as chamadas de IA
3. **Consultar histórico** usando o mesmo ID
4. **Ver estatísticas** do usuário 