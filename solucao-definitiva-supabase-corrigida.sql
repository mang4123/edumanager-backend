-- SOLUÇÃO DEFINITIVA PARA O SUPABASE - VERSÃO CORRIGIDA
-- Execute este script no SQL Editor do Supabase

-- 1. DESABILITAR RLS TEMPORARIAMENTE PARA TESTES
ALTER TABLE aulas DISABLE ROW LEVEL SECURITY;
ALTER TABLE alunos DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercicios DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercicio_alunos DISABLE ROW LEVEL SECURITY;
ALTER TABLE duvidas DISABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro DISABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Professores podem ver suas próprias aulas" ON aulas;
DROP POLICY IF EXISTS "Professores podem ver seus próprios alunos" ON alunos;
DROP POLICY IF EXISTS "Professores podem ver seus próprios exercícios" ON exercicios;
DROP POLICY IF EXISTS "Professores podem ver exercícios dos seus alunos" ON exercicio_alunos;
DROP POLICY IF EXISTS "Professores podem ver suas próprias dúvidas" ON duvidas;
DROP POLICY IF EXISTS "Professores podem ver seus próprios dados financeiros" ON financeiro;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON notificacoes;
DROP POLICY IF EXISTS "Alunos podem ver suas próprias aulas" ON aulas;
DROP POLICY IF EXISTS "Alunos podem ver suas próprias dúvidas" ON duvidas;
DROP POLICY IF EXISTS "Alunos podem ver seus próprios exercícios" ON exercicio_alunos;
DROP POLICY IF EXISTS "Acesso total aulas para desenvolvimento" ON aulas;
DROP POLICY IF EXISTS "Acesso total alunos para desenvolvimento" ON alunos;
DROP POLICY IF EXISTS "Acesso total exercicios para desenvolvimento" ON exercicios;
DROP POLICY IF EXISTS "Acesso total exercicio_alunos para desenvolvimento" ON exercicio_alunos;
DROP POLICY IF EXISTS "Acesso total duvidas para desenvolvimento" ON duvidas;
DROP POLICY IF EXISTS "Acesso total financeiro para desenvolvimento" ON financeiro;
DROP POLICY IF EXISTS "Acesso total notificacoes para desenvolvimento" ON notificacoes;

-- 3. REMOVER RELACIONAMENTOS PROBLEMÁTICOS
ALTER TABLE alunos DROP CONSTRAINT IF EXISTS alunos_id_fkey;
ALTER TABLE alunos DROP CONSTRAINT IF EXISTS alunos_professor_id_fkey;
ALTER TABLE alunos DROP CONSTRAINT IF EXISTS alunos_aluno_id_fkey;

-- 4. RECRIAR RELACIONAMENTOS CORRETOS
ALTER TABLE alunos 
ADD CONSTRAINT alunos_professor_id_fkey 
FOREIGN KEY (professor_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE alunos 
ADD CONSTRAINT alunos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 5. INSERIR DADOS DE EXEMPLO PARA SEU USUÁRIO
-- Primeiro, gerar um UUID para o aluno de exemplo
DO $$
DECLARE
    aluno_uuid UUID;
BEGIN
    -- Gerar UUID único para o aluno
    aluno_uuid := gen_random_uuid();
    
    -- Inserir profile de aluno para teste
    INSERT INTO profiles (id, nome, email, tipo, professor_id) 
    VALUES (
        aluno_uuid,
        'João Silva',
        'joao.silva@exemplo.com',
        'aluno',
        'e650f5ee-747b-4574-9bfa-8e2d411c4974'
    ) ON CONFLICT (email) DO UPDATE SET
        nome = EXCLUDED.nome,
        tipo = EXCLUDED.tipo,
        professor_id = EXCLUDED.professor_id;
    
    -- Inserir na tabela alunos
    INSERT INTO alunos (professor_id, aluno_id, ativo)
    VALUES (
        'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid,
        aluno_uuid,
        true
    ) ON CONFLICT (professor_id, aluno_id) DO NOTHING;
    
    -- Inserir aulas de exemplo
    INSERT INTO aulas (professor_id, aluno_id, data_hora, duracao, assunto, materia, status)
    VALUES 
        ('e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid, aluno_uuid, NOW() + INTERVAL '1 day', 60, 'Aula de Matemática - Equações', 'Matemática', 'agendada'),
        ('e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid, aluno_uuid, NOW() + INTERVAL '2 days', 60, 'Aula de Física - Newton', 'Física', 'agendada'),
        ('e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid, aluno_uuid, NOW() + INTERVAL '3 days', 60, 'Aula de Química - Balanceamento', 'Química', 'agendada');
    
    RAISE NOTICE 'Dados de exemplo inseridos com sucesso!';
END $$;

-- 6. INSERIR SEGUNDO ALUNO PARA MAIS DADOS
DO $$
DECLARE
    aluno_uuid2 UUID;
BEGIN
    -- Gerar UUID único para o segundo aluno
    aluno_uuid2 := gen_random_uuid();
    
    -- Inserir segundo profile de aluno
    INSERT INTO profiles (id, nome, email, tipo, professor_id) 
    VALUES (
        aluno_uuid2,
        'Maria Santos',
        'maria.santos@exemplo.com',
        'aluno',
        'e650f5ee-747b-4574-9bfa-8e2d411c4974'
    ) ON CONFLICT (email) DO UPDATE SET
        nome = EXCLUDED.nome,
        tipo = EXCLUDED.tipo,
        professor_id = EXCLUDED.professor_id;
    
    -- Inserir na tabela alunos
    INSERT INTO alunos (professor_id, aluno_id, ativo)
    VALUES (
        'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid,
        aluno_uuid2,
        true
    ) ON CONFLICT (professor_id, aluno_id) DO NOTHING;
    
    -- Inserir aulas de exemplo para o segundo aluno
    INSERT INTO aulas (professor_id, aluno_id, data_hora, duracao, assunto, materia, status)
    VALUES 
        ('e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid, aluno_uuid2, NOW() + INTERVAL '1 hour', 60, 'Aula de Matemática - Funções', 'Matemática', 'agendada'),
        ('e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid, aluno_uuid2, NOW() + INTERVAL '4 days', 60, 'Aula de Física - Energia', 'Física', 'agendada');
    
    RAISE NOTICE 'Segundo aluno inserido com sucesso!';
END $$;

-- 7. CRIAR POLÍTICAS PERMISSIVAS (PARA DESENVOLVIMENTO)
-- Política para aulas - MUITO PERMISSIVA
CREATE POLICY "Acesso total aulas para desenvolvimento" ON aulas
    FOR ALL USING (true) WITH CHECK (true);

-- Política para alunos - MUITO PERMISSIVA  
CREATE POLICY "Acesso total alunos para desenvolvimento" ON alunos
    FOR ALL USING (true) WITH CHECK (true);

-- Política para exercícios - MUITO PERMISSIVA
CREATE POLICY "Acesso total exercicios para desenvolvimento" ON exercicios
    FOR ALL USING (true) WITH CHECK (true);

-- Política para exercicio_alunos - MUITO PERMISSIVA
CREATE POLICY "Acesso total exercicio_alunos para desenvolvimento" ON exercicio_alunos
    FOR ALL USING (true) WITH CHECK (true);

-- Política para duvidas - MUITO PERMISSIVA
CREATE POLICY "Acesso total duvidas para desenvolvimento" ON duvidas
    FOR ALL USING (true) WITH CHECK (true);

-- Política para financeiro - MUITO PERMISSIVA
CREATE POLICY "Acesso total financeiro para desenvolvimento" ON financeiro
    FOR ALL USING (true) WITH CHECK (true);

-- Política para notificacoes - MUITO PERMISSIVA
CREATE POLICY "Acesso total notificacoes para desenvolvimento" ON notificacoes
    FOR ALL USING (true) WITH CHECK (true);

-- 8. REABILITAR RLS
ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercicio_alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE duvidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- 9. CONFIGURAR PARA ACEITAR REQUISIÇÕES ANÔNIMAS (DESENVOLVIMENTO)
-- Isso permite que o frontend acesse mesmo sem auth perfeita
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 10. VERIFICAR SE TUDO ESTÁ FUNCIONANDO
SELECT 'Verificação de dados:' as status;
SELECT 'Profiles:', count(*) FROM profiles WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';
SELECT 'Alunos:', count(*) FROM alunos WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';
SELECT 'Aulas:', count(*) FROM aulas WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';
SELECT 'Exercícios:', count(*) FROM exercicios WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';

-- 11. TESTAR CONSULTAS COMO O FRONTEND FARIA
SELECT 'Teste consulta aulas:' as teste;
SELECT id, assunto, materia, data_hora, status FROM aulas 
WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974' 
ORDER BY data_hora 
LIMIT 5;

SELECT 'Teste consulta alunos:' as teste;
SELECT a.id, p.nome, p.email, a.ativo FROM alunos a
JOIN profiles p ON p.id = a.aluno_id
WHERE a.professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974' 
AND a.ativo = true 
LIMIT 5;

COMMIT; 