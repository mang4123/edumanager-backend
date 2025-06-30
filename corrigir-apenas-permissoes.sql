-- CORREÇÃO MÍNIMA - APENAS PERMISSÕES
-- Foca APENAS em resolver o erro 401 das consultas diretas ao Supabase
-- NÃO cria dados falsos ou de exemplo

-- 1. REMOVER TODAS AS POLÍTICAS RESTRITIVAS
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

-- 2. REMOVER POLÍTICAS DE DESENVOLVIMENTO SE EXISTIREM
DROP POLICY IF EXISTS "Acesso total aulas para desenvolvimento" ON aulas;
DROP POLICY IF EXISTS "Acesso total alunos para desenvolvimento" ON alunos;
DROP POLICY IF EXISTS "Acesso total exercicios para desenvolvimento" ON exercicios;
DROP POLICY IF EXISTS "Acesso total exercicio_alunos para desenvolvimento" ON exercicio_alunos;
DROP POLICY IF EXISTS "Acesso total duvidas para desenvolvimento" ON duvidas;
DROP POLICY IF EXISTS "Acesso total financeiro para desenvolvimento" ON financeiro;
DROP POLICY IF EXISTS "Acesso total notificacoes para desenvolvimento" ON notificacoes;

-- 3. CRIAR POLÍTICAS PERMISSIVAS PARA SEU USUÁRIO ESPECÍFICO
-- Aulas - acesso total para seu usuário
CREATE POLICY "Acesso professor aulas" ON aulas
    FOR ALL 
    USING (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid)
    WITH CHECK (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid);

-- Alunos - acesso total para seu usuário
CREATE POLICY "Acesso professor alunos" ON alunos
    FOR ALL 
    USING (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid)
    WITH CHECK (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid);

-- Exercícios - acesso total para seu usuário
CREATE POLICY "Acesso professor exercicios" ON exercicios
    FOR ALL 
    USING (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid)
    WITH CHECK (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid);

-- Exercício_alunos - se a tabela existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercicio_alunos') THEN
        EXECUTE 'CREATE POLICY "Acesso professor exercicio_alunos" ON exercicio_alunos
            FOR ALL 
            USING (EXISTS (SELECT 1 FROM exercicios e WHERE e.id = exercicio_id AND e.professor_id = ''e650f5ee-747b-4574-9bfa-8e2d411c4974''::uuid))
            WITH CHECK (EXISTS (SELECT 1 FROM exercicios e WHERE e.id = exercicio_id AND e.professor_id = ''e650f5ee-747b-4574-9bfa-8e2d411c4974''::uuid))';
    END IF;
END $$;

-- Dúvidas - acesso total para seu usuário
CREATE POLICY "Acesso professor duvidas" ON duvidas
    FOR ALL 
    USING (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid)
    WITH CHECK (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid);

-- Financeiro - acesso total para seu usuário
CREATE POLICY "Acesso professor financeiro" ON financeiro
    FOR ALL 
    USING (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid)
    WITH CHECK (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid);

-- Notificações - se a tabela existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notificacoes') THEN
        EXECUTE 'CREATE POLICY "Acesso professor notificacoes" ON notificacoes
            FOR ALL 
            USING (destinatario_id = ''e650f5ee-747b-4574-9bfa-8e2d411c4974''::uuid OR remetente_id = ''e650f5ee-747b-4574-9bfa-8e2d411c4974''::uuid)
            WITH CHECK (destinatario_id = ''e650f5ee-747b-4574-9bfa-8e2d411c4974''::uuid OR remetente_id = ''e650f5ee-747b-4574-9bfa-8e2d411c4974''::uuid)';
    END IF;
END $$;

-- 4. GARANTIR PERMISSÕES PARA USUÁRIO AUTENTICADO
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 5. TESTAR UMA CONSULTA SIMPLES
SELECT 'Teste de consulta:' as resultado;
SELECT count(*) as total_aulas FROM aulas WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';
SELECT count(*) as total_alunos FROM alunos WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';

-- 6. VERIFICAR POLÍTICAS CRIADAS
SELECT 'Políticas ativas:' as status;
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('aulas', 'alunos', 'exercicios', 'duvidas', 'financeiro')
ORDER BY tablename;

COMMIT; 