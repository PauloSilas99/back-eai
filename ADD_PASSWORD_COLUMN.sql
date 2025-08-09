-- Script para adicionar coluna de senha à tabela users
-- Execute este script no Editor SQL do Supabase para adicionar autenticação

-- 1. Adicionar coluna de senha (hash) à tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- 2. Adicionar coluna para controle de limitação de requisições
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS max_requests INTEGER DEFAULT 10;

-- 3. Atualizar a constraint de plan_type para incluir validação de limitações
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_plan_type_check;

ALTER TABLE users 
ADD CONSTRAINT users_plan_type_check 
CHECK (plan_type IN ('free', 'premium'));

-- 4. Criar função para definir limites baseados no plano
CREATE OR REPLACE FUNCTION set_user_limits()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.plan_type = 'free' THEN
        NEW.max_requests = 10;
    ELSIF NEW.plan_type = 'premium' THEN
        NEW.max_requests = 999999; -- Praticamente ilimitado
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar trigger para aplicar limites automaticamente
DROP TRIGGER IF EXISTS trigger_set_user_limits ON users;
CREATE TRIGGER trigger_set_user_limits
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_user_limits();

-- 6. Atualizar usuários existentes com limites apropriados
UPDATE users 
SET max_requests = CASE 
    WHEN plan_type = 'free' THEN 10 
    WHEN plan_type = 'premium' THEN 999999 
    ELSE 10 
END
WHERE max_requests IS NULL;

-- 7. Adicionar índice para melhorar performance de busca por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 8. Verificar se as alterações foram aplicadas
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('password_hash', 'max_requests')
ORDER BY column_name; 