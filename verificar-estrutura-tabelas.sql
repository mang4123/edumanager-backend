-- VERIFICAR ESTRUTURA REAL DAS TABELAS
-- Execute este script para ver o que realmente existe

-- 1. Ver estrutura da tabela exercicios
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'exercicios'
ORDER BY ordinal_position;

-- 2. Ver estrutura da tabela aulas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'aulas'
ORDER BY ordinal_position;

-- 3. Ver estrutura da tabela alunos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'alunos'
ORDER BY ordinal_position;

-- 4. Ver estrutura da tabela duvidas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'duvidas'
ORDER BY ordinal_position;

-- 5. Ver estrutura da tabela financeiro
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'financeiro'
ORDER BY ordinal_position;

-- 6. Ver políticas RLS atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('aulas', 'alunos', 'exercicios', 'duvidas', 'financeiro')
ORDER BY tablename, policyname; 