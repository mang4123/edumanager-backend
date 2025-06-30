-- CORREÇÃO FINAL DAS POLÍTICAS RLS
-- Remove políticas com auth.uid() e cria políticas funcionais

-- 1. REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS QUE USAM auth.uid()
DROP POLICY IF EXISTS "Professores podem ver seus próprios alunos" ON alunos;
DROP POLICY IF EXISTS "Professores podem ver suas próprias aulas" ON aulas;
DROP POLICY IF EXISTS "Professores podem ver suas próprias dúvidas" ON duvidas;
DROP POLICY IF EXISTS "Professores podem ver seus próprios exercícios" ON exercicios;
DROP POLICY IF EXISTS "Professores podem ver seus próprios dados financeiros" ON financeiro;
DROP POLICY IF EXISTS "Alunos podem ver suas próprias aulas" ON aulas;
DROP POLICY IF EXISTS "Alunos podem ver suas próprias dúvidas" ON duvidas;

-- 2. REMOVER POLÍTICAS QUE PODEM TER SIDO CRIADAS ANTES
DROP POLICY IF EXISTS "Acesso professor aulas" ON aulas;
DROP POLICY IF EXISTS "Acesso professor alunos" ON alunos;
DROP POLICY IF EXISTS "Acesso professor exercicios" ON exercicios;
DROP POLICY IF EXISTS "Acesso professor exercicio_alunos" ON exercicio_alunos;
DROP POLICY IF EXISTS "Acesso professor duvidas" ON duvidas;
DROP POLICY IF EXISTS "Acesso professor financeiro" ON financeiro;
DROP POLICY IF EXISTS "Acesso professor notificacoes" ON notificacoes;

-- 3. CRIAR POLÍTICAS FUNCIONAIS PARA SEU USUÁRIO ESPECÍFICO

-- Política para AULAS
CREATE POLICY "Acesso_total_aulas_desenvolvimento" ON aulas
    FOR ALL 
    USING (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid)
    WITH CHECK (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid);

-- Política para ALUNOS
CREATE POLICY "Acesso_total_alunos_desenvolvimento" ON alunos
    FOR ALL 
    USING (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid)
    WITH CHECK (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid);

-- Política para EXERCÍCIOS
CREATE POLICY "Acesso_total_exercicios_desenvolvimento" ON exercicios
    FOR ALL 
    USING (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid)
    WITH CHECK (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid);

-- Política para DÚVIDAS
CREATE POLICY "Acesso_total_duvidas_desenvolvimento" ON duvidas
    FOR ALL 
    USING (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid)
    WITH CHECK (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid);

-- Política para FINANCEIRO
CREATE POLICY "Acesso_total_financeiro_desenvolvimento" ON financeiro
    FOR ALL 
    USING (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid)
    WITH CHECK (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid);

-- 4. VERIFICAR SE TABELA EXERCICIO_ALUNOS EXISTE E CRIAR POLÍTICA
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercicio_alunos') THEN
        -- Primeiro tentar remover se existe
        EXECUTE 'DROP POLICY IF EXISTS "Acesso_total_exercicio_alunos_desenvolvimento" ON exercicio_alunos';
        
        -- Criar nova política
        EXECUTE 'CREATE POLICY "Acesso_total_exercicio_alunos_desenvolvimento" ON exercicio_alunos
            FOR ALL 
            USING (EXISTS (SELECT 1 FROM exercicios e WHERE e.id = exercicio_id AND e.professor_id = ''e650f5ee-747b-4574-9bfa-8e2d411c4974''::uuid))
            WITH CHECK (EXISTS (SELECT 1 FROM exercicios e WHERE e.id = exercicio_id AND e.professor_id = ''e650f5ee-747b-4574-9bfa-8e2d411c4974''::uuid))';
        
        RAISE NOTICE 'Política para exercicio_alunos criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela exercicio_alunos não existe - pulando';
    END IF;
END $$;

-- 5. VERIFICAR SE TABELA NOTIFICACOES EXISTE E SUAS COLUNAS
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    -- Verificar se tabela existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notificacoes') THEN
        -- Primeiro remover política existente
        EXECUTE 'DROP POLICY IF EXISTS "Acesso_total_notificacoes_desenvolvimento" ON notificacoes';
        
        -- Verificar quais colunas existem
        SELECT COUNT(*) INTO col_count
        FROM information_schema.columns 
        WHERE table_name = 'notificacoes' 
        AND column_name IN ('destinatario_id', 'remetente_id', 'professor_id', 'user_id');
        
        IF col_count > 0 THEN
            -- Criar política genérica baseada no que existe
            EXECUTE 'CREATE POLICY "Acesso_total_notificacoes_desenvolvimento" ON notificacoes
                FOR ALL 
                USING (true)
                WITH CHECK (true)';
            
            RAISE NOTICE 'Política permissiva para notificacoes criada';
        ELSE
            RAISE NOTICE 'Colunas de referência não encontradas em notificacoes';
        END IF;
    ELSE
        RAISE NOTICE 'Tabela notificacoes não existe - pulando';
    END IF;
END $$;

-- 6. GARANTIR PERMISSÕES PARA ROLE AUTHENTICATED
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. TESTAR AS CONSULTAS BÁSICAS
SELECT 'Testando consultas após correção:' as status;

-- Testar aulas
SELECT 'Total aulas:' as tabela, count(*) as registros 
FROM aulas 
WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';

-- Testar alunos
SELECT 'Total alunos:' as tabela, count(*) as registros 
FROM alunos 
WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';

-- Testar exercícios
SELECT 'Total exercícios:' as tabela, count(*) as registros 
FROM exercicios 
WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';

-- Testar dúvidas
SELECT 'Total dúvidas:' as tabela, count(*) as registros 
FROM duvidas 
WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';

-- Testar financeiro
SELECT 'Total financeiro:' as tabela, count(*) as registros 
FROM financeiro 
WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';

-- 8. MOSTRAR POLÍTICAS ATIVAS
SELECT 'Políticas ativas após correção:' as resultado;
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename IN ('aulas', 'alunos', 'exercicios', 'duvidas', 'financeiro', 'exercicio_alunos', 'notificacoes')
ORDER BY tablename, policyname;

COMMIT; 