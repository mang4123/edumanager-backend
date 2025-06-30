-- Script para corrigir relacionamentos entre tabelas
-- Execute este no SQL Editor do Supabase

-- 1. Remover relacionamento incorreto (se existir)
ALTER TABLE alunos DROP CONSTRAINT IF EXISTS alunos_id_fkey;

-- 2. Verificar se existe relacionamento correto
-- Se não existir, criar o relacionamento correto
DO $$
BEGIN
    -- Verificar se a constraint já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'alunos_aluno_id_fkey'
        AND table_name = 'alunos'
    ) THEN
        -- Criar constraint correta
        ALTER TABLE alunos 
        ADD CONSTRAINT alunos_aluno_id_fkey 
        FOREIGN KEY (aluno_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Verificar se existe relacionamento professor
DO $$
BEGIN
    -- Verificar se a constraint já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'alunos_professor_id_fkey'
        AND table_name = 'alunos'
    ) THEN
        -- Criar constraint correta
        ALTER TABLE alunos 
        ADD CONSTRAINT alunos_professor_id_fkey 
        FOREIGN KEY (professor_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Verificar relacionamentos atuais
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid = 'alunos'::regclass
AND contype = 'f'
ORDER BY conname;

-- 5. Verificar se há dados na tabela alunos
SELECT 'Total alunos:', count(*) FROM alunos;
SELECT 'Professor específico:', count(*) FROM alunos WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';

-- 6. Listar estrutura da tabela alunos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'alunos' 
ORDER BY ordinal_position; 