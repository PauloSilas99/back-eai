-- Script para atualizar as tabelas existentes com relações de usuário
-- Execute este script no Editor SQL do Supabase

-- 1. Criar tabela de usuários (se não existir)
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

-- 2. Adicionar constraints de foreign key nas tabelas existentes
-- Primeiro, remover as constraints existentes se houver
ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_user_id_fkey;
ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_user_id_fkey;
ALTER TABLE mindmaps DROP CONSTRAINT IF EXISTS mindmaps_user_id_fkey;
ALTER TABLE question_evaluations DROP CONSTRAINT IF EXISTS question_evaluations_user_id_fkey;

-- 3. Adicionar as novas constraints
ALTER TABLE chats ADD CONSTRAINT chats_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE quizzes ADD CONSTRAINT quizzes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE mindmaps ADD CONSTRAINT mindmaps_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE question_evaluations ADD CONSTRAINT question_evaluations_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 4. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Criar trigger na tabela users (se não existir)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Inserir um usuário de exemplo (opcional)
INSERT INTO users (email, name) 
VALUES ('admin@exemplo.com', 'Administrador')
ON CONFLICT (email) DO NOTHING;

-- 7. Verificar se as tabelas foram atualizadas corretamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'chats', 'quizzes', 'mindmaps', 'question_evaluations')
ORDER BY table_name, ordinal_position; 