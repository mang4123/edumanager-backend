-- TESTE RÁPIDO - VERIFICAR SE SISTEMA FUNCIONA
-- Execute no SQL Editor do Supabase

-- 1. CRIAR UM ALUNO DE TESTE (se não existir)
DO $$
DECLARE
    aluno_id UUID;
BEGIN
    -- Gerar UUID para aluno
    aluno_id := gen_random_uuid();
    
    -- Inserir profile do aluno
    INSERT INTO profiles (id, nome, email, tipo, professor_id)
    VALUES (
        aluno_id,
        'Teste Aluno',
        'teste@aluno.com',
        'aluno',
        'e650f5ee-747b-4574-9bfa-8e2d411c4974'
    ) ON CONFLICT (email) DO NOTHING;
    
    -- Inserir na tabela alunos
    INSERT INTO alunos (professor_id, aluno_id, ativo)
    VALUES (
        'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid,
        aluno_id,
        true
    ) ON CONFLICT (professor_id, aluno_id) DO NOTHING;
    
    -- Inserir uma aula de teste
    INSERT INTO aulas (professor_id, aluno_id, data_hora, duracao, assunto, materia, status)
    VALUES (
        'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid,
        aluno_id,
        NOW() + INTERVAL '1 day',
        60,
        'Aula Teste',
        'Matemática',
        'agendada'
    );
    
    RAISE NOTICE 'Dados de teste criados com sucesso!';
END $$;

-- 2. TESTAR CONSULTAS BÁSICAS
SELECT 'TESTE 1 - Alunos:' as teste;
SELECT count(*) as total FROM alunos WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';

SELECT 'TESTE 2 - Aulas:' as teste;
SELECT count(*) as total FROM aulas WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';

SELECT 'TESTE 3 - Consulta Alunos com dados:' as teste;
SELECT a.id, a.ativo, p.nome, p.email 
FROM alunos a 
JOIN profiles p ON p.id = a.aluno_id 
WHERE a.professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974' 
LIMIT 3;

SELECT 'TESTE 4 - Consulta Aulas com dados:' as teste;
SELECT au.id, au.assunto, au.data_hora, p.nome as aluno_nome
FROM aulas au
JOIN profiles p ON p.id = au.aluno_id
WHERE au.professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'
LIMIT 3; 