-- SOLUÇÃO DEFINITIVA PARA O SUPABASE - VERSÃO FINAL
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

-- 3. CRIAR CONSTRAINT ÚNICA NO EMAIL (SE NÃO EXISTIR)
DO $$
BEGIN
    -- Tentar criar constraint única no email
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_email_unique'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
        RAISE NOTICE 'Constraint única no email criada com sucesso!';
    ELSE
        RAISE NOTICE 'Constraint única no email já existe!';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Aviso: Não foi possível criar constraint única no email: %', SQLERRM;
END $$;

-- 4. REMOVER RELACIONAMENTOS PROBLEMÁTICOS
ALTER TABLE alunos DROP CONSTRAINT IF EXISTS alunos_id_fkey;
ALTER TABLE alunos DROP CONSTRAINT IF EXISTS alunos_professor_id_fkey;
ALTER TABLE alunos DROP CONSTRAINT IF EXISTS alunos_aluno_id_fkey;

-- 5. RECRIAR RELACIONAMENTOS CORRETOS
ALTER TABLE alunos 
ADD CONSTRAINT alunos_professor_id_fkey 
FOREIGN KEY (professor_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE alunos 
ADD CONSTRAINT alunos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 6. INSERIR DADOS DE EXEMPLO PARA SEU USUÁRIO
-- Primeiro aluno
DO $$
DECLARE
    aluno_uuid UUID;
    existing_profile UUID;
BEGIN
    -- Verificar se já existe profile com este email
    SELECT id INTO existing_profile FROM profiles WHERE email = 'joao.silva@exemplo.com';
    
    IF existing_profile IS NULL THEN
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
        );
        
        RAISE NOTICE 'Profile João Silva criado com UUID: %', aluno_uuid;
    ELSE
        aluno_uuid := existing_profile;
        -- Atualizar dados existentes
        UPDATE profiles SET 
            nome = 'João Silva',
            tipo = 'aluno',
            professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'
        WHERE id = existing_profile;
        
        RAISE NOTICE 'Profile João Silva atualizado com UUID: %', aluno_uuid;
    END IF;
    
    -- Inserir na tabela alunos
    INSERT INTO alunos (professor_id, aluno_id, ativo)
    VALUES (
        'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid,
        aluno_uuid,
        true
    ) ON CONFLICT (professor_id, aluno_id) DO UPDATE SET ativo = true;
    
    -- Inserir aulas de exemplo
    INSERT INTO aulas (professor_id, aluno_id, data_hora, duracao, assunto, materia, status)
    VALUES 
        ('e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid, aluno_uuid, NOW() + INTERVAL '1 day', 60, 'Aula de Matemática - Equações', 'Matemática', 'agendada'),
        ('e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid, aluno_uuid, NOW() + INTERVAL '2 days', 60, 'Aula de Física - Newton', 'Física', 'agendada'),
        ('e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid, aluno_uuid, NOW() + INTERVAL '3 days', 60, 'Aula de Química - Balanceamento', 'Química', 'agendada');
    
    RAISE NOTICE 'Aulas para João Silva inseridas com sucesso!';
END $$;

-- 7. INSERIR SEGUNDO ALUNO PARA MAIS DADOS
DO $$
DECLARE
    aluno_uuid2 UUID;
    existing_profile2 UUID;
BEGIN
    -- Verificar se já existe profile com este email
    SELECT id INTO existing_profile2 FROM profiles WHERE email = 'maria.santos@exemplo.com';
    
    IF existing_profile2 IS NULL THEN
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
        );
        
        RAISE NOTICE 'Profile Maria Santos criado com UUID: %', aluno_uuid2;
    ELSE
        aluno_uuid2 := existing_profile2;
        -- Atualizar dados existentes
        UPDATE profiles SET 
            nome = 'Maria Santos',
            tipo = 'aluno',
            professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'
        WHERE id = existing_profile2;
        
        RAISE NOTICE 'Profile Maria Santos atualizado com UUID: %', aluno_uuid2;
    END IF;
    
    -- Inserir na tabela alunos
    INSERT INTO alunos (professor_id, aluno_id, ativo)
    VALUES (
        'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid,
        aluno_uuid2,
        true
    ) ON CONFLICT (professor_id, aluno_id) DO UPDATE SET ativo = true;
    
    -- Inserir aulas de exemplo para o segundo aluno
    INSERT INTO aulas (professor_id, aluno_id, data_hora, duracao, assunto, materia, status)
    VALUES 
        ('e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid, aluno_uuid2, NOW() + INTERVAL '1 hour', 60, 'Aula de Matemática - Funções', 'Matemática', 'agendada'),
        ('e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid, aluno_uuid2, NOW() + INTERVAL '4 days', 60, 'Aula de Física - Energia', 'Física', 'agendada');
    
    RAISE NOTICE 'Aulas para Maria Santos inseridas com sucesso!';
END $$;

-- 8. INSERIR EXERCÍCIOS DE EXEMPLO
INSERT INTO exercicios (professor_id, titulo, descricao, materia, data_criacao, prazo)
VALUES 
    ('e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid, 'Lista de Matemática - Equações do 2º Grau', 'Resolver exercícios 1 a 10 da apostila', 'Matemática', NOW(), NOW() + INTERVAL '7 days'),
    ('e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid, 'Física - Leis de Newton', 'Problemas sobre força e aceleração', 'Física', NOW(), NOW() + INTERVAL '5 days'),
    ('e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid, 'Química - Balanceamento', 'Balancear as equações químicas da lista', 'Química', NOW(), NOW() + INTERVAL '3 days');

-- 9. INSERIR DÚVIDAS DE EXEMPLO
INSERT INTO duvidas (aluno_id, professor_id, assunto, pergunta, status)
SELECT 
    p.id,
    'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid,
    'Matemática - Equações',
    'Professor, não entendi como resolver equações do segundo grau. Pode me ajudar?',
    'pendente'
FROM profiles p 
WHERE p.email = 'joao.silva@exemplo.com'
LIMIT 1;

INSERT INTO duvidas (aluno_id, professor_id, assunto, pergunta, status)
SELECT 
    p.id,
    'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid,
    'Física - Newton',
    'Como calcular a força resultante quando há várias forças?',
    'pendente'
FROM profiles p 
WHERE p.email = 'maria.santos@exemplo.com'
LIMIT 1;

-- 10. INSERIR DADOS FINANCEIROS DE EXEMPLO
INSERT INTO financeiro (professor_id, aluno_id, tipo, valor, descricao, data_vencimento, status)
SELECT 
    'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid,
    p.id,
    'mensalidade',
    250.00,
    'Mensalidade Janeiro 2024',
    NOW() + INTERVAL '15 days',
    'pendente'
FROM profiles p 
WHERE p.email IN ('joao.silva@exemplo.com', 'maria.santos@exemplo.com');

-- 11. CRIAR POLÍTICAS PERMISSIVAS (PARA DESENVOLVIMENTO)
CREATE POLICY "Acesso total aulas para desenvolvimento" ON aulas
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso total alunos para desenvolvimento" ON alunos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso total exercicios para desenvolvimento" ON exercicios
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso total exercicio_alunos para desenvolvimento" ON exercicio_alunos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso total duvidas para desenvolvimento" ON duvidas
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso total financeiro para desenvolvimento" ON financeiro
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso total notificacoes para desenvolvimento" ON notificacoes
    FOR ALL USING (true) WITH CHECK (true);

-- 12. REABILITAR RLS
ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercicio_alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE duvidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- 13. CONFIGURAR PARA ACEITAR REQUISIÇÕES ANÔNIMAS (DESENVOLVIMENTO)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 14. VERIFICAR SE TUDO ESTÁ FUNCIONANDO
SELECT 'Verificação de dados:' as status;
SELECT 'Profiles:', count(*) FROM profiles WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';
SELECT 'Alunos:', count(*) FROM alunos WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';
SELECT 'Aulas:', count(*) FROM aulas WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';
SELECT 'Exercícios:', count(*) FROM exercicios WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';
SELECT 'Dúvidas:', count(*) FROM duvidas WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';
SELECT 'Financeiro:', count(*) FROM financeiro WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';

-- 15. TESTAR CONSULTAS COMO O FRONTEND FARIA
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

SELECT 'Teste consulta exercícios:' as teste;
SELECT id, titulo, materia, prazo FROM exercicios
WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'
ORDER BY data_criacao DESC
LIMIT 3;

SELECT 'Teste consulta dúvidas:' as teste;
SELECT d.id, p.nome as aluno_nome, d.assunto, d.pergunta, d.status FROM duvidas d
JOIN profiles p ON p.id = d.aluno_id
WHERE d.professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'
ORDER BY d.data_criacao DESC
LIMIT 3;

SELECT 'Teste consulta financeiro:' as teste;
SELECT f.id, p.nome as aluno_nome, f.tipo, f.valor, f.status FROM financeiro f
JOIN profiles p ON p.id = f.aluno_id
WHERE f.professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'
ORDER BY f.data_criacao DESC
LIMIT 3;

COMMIT; 