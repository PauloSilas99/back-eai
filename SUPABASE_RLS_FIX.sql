-- Script para corrigir permissões do Supabase
-- Execute este script no Editor SQL do Supabase

-- 1. Verificar se RLS está ativo na tabela users
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- 2. Desabilitar RLS temporariamente para visualização (OPCIONAL)
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. Ou criar políticas que permitam visualização
-- Política para permitir SELECT em todos os registros
DROP POLICY IF EXISTS "Allow select all users" ON users;
CREATE POLICY "Allow select all users" ON users
    FOR SELECT USING (true);

-- Política para permitir INSERT
DROP POLICY IF EXISTS "Allow insert users" ON users;
CREATE POLICY "Allow insert users" ON users
    FOR INSERT WITH CHECK (true);

-- Política para permitir UPDATE
DROP POLICY IF EXISTS "Allow update users" ON users;
CREATE POLICY "Allow update users" ON users
    FOR UPDATE USING (true);

-- Política para permitir DELETE
DROP POLICY IF EXISTS "Allow delete users" ON users;
CREATE POLICY "Allow delete users" ON users
    FOR DELETE USING (true);

-- 4. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 5. Verificar dados na tabela users
SELECT * FROM users ORDER BY created_at DESC;

-- 6. Contar total de usuários
SELECT COUNT(*) as total_users FROM users; 