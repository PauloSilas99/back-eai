-- Script completo para criar todas as tabelas do zero
-- Execute este script no Editor SQL do Supabase

-- 1. Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
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

-- 2. Criar tabela para histórico de chats
CREATE TABLE IF NOT EXISTS chats (
  id SERIAL PRIMARY KEY,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela para histórico de quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id SERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  quiz_data JSONB NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela para histórico de mapas mentais
CREATE TABLE IF NOT EXISTS mindmaps (
  id SERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  mindmap_data JSONB NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela para avaliações de questões
CREATE TABLE IF NOT EXISTS question_evaluations (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  evaluation_data JSONB NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_mindmaps_user_id ON mindmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_question_evaluations_user_id ON question_evaluations(user_id);

-- 7. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Criar trigger na tabela users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Inserir um usuário de exemplo
INSERT INTO users (email, name) 
VALUES ('admin@exemplo.com', 'Administrador')
ON CONFLICT (email) DO NOTHING;

-- 10. Verificar se as tabelas foram criadas corretamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'chats', 'quizzes', 'mindmaps', 'question_evaluations')
ORDER BY table_name, ordinal_position; 