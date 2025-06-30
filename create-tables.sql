-- Criar tabelas para o Sistema EduManager
-- Execute este script no SQL Editor do Supabase

-- 1. Tabela de aulas
CREATE TABLE IF NOT EXISTS aulas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    aluno_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    duracao INTEGER DEFAULT 60, -- em minutos
    assunto TEXT NOT NULL,
    materia VARCHAR(100),
    topico TEXT,
    observacoes TEXT,
    status VARCHAR(20) DEFAULT 'agendada' CHECK (status IN ('agendada', 'realizada', 'cancelada', 'reagendada')),
    tipo VARCHAR(20) DEFAULT 'presencial' CHECK (tipo IN ('presencial', 'online')),
    valor DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de alunos (relacionamento professor-aluno)
CREATE TABLE IF NOT EXISTS alunos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    aluno_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    ativo BOOLEAN DEFAULT true,
    data_inicio DATE DEFAULT CURRENT_DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(professor_id, aluno_id)
);

-- 3. Tabela de exercícios
CREATE TABLE IF NOT EXISTS exercicios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    materia VARCHAR(100),
    dificuldade VARCHAR(20) DEFAULT 'médio' CHECK (dificuldade IN ('fácil', 'médio', 'difícil')),
    prazo DATE,
    status VARCHAR(20) DEFAULT 'criado' CHECK (status IN ('criado', 'enviado', 'corrigido', 'arquivado')),
    pontuacao INTEGER DEFAULT 10,
    questoes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de exercícios atribuídos aos alunos
CREATE TABLE IF NOT EXISTS exercicio_alunos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exercicio_id UUID REFERENCES exercicios(id) ON DELETE CASCADE,
    aluno_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'entregue', 'corrigido')),
    data_entrega TIMESTAMP WITH TIME ZONE,
    nota DECIMAL(5,2),
    feedback TEXT,
    resposta JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exercicio_id, aluno_id)
);

-- 5. Tabela de dúvidas
CREATE TABLE IF NOT EXISTS duvidas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    aluno_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    pergunta TEXT NOT NULL,
    resposta TEXT,
    status VARCHAR(20) DEFAULT 'aberta' CHECK (status IN ('aberta', 'respondida', 'resolvida')),
    materia VARCHAR(100),
    prioridade VARCHAR(20) DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela financeira
CREATE TABLE IF NOT EXISTS financeiro (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    aluno_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    aula_id UUID REFERENCES aulas(id) ON DELETE SET NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('aula', 'mensalidade', 'material', 'outros')),
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
    data_vencimento DATE,
    data_pagamento DATE,
    metodo_pagamento VARCHAR(50),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'info' CHECK (tipo IN ('info', 'aviso', 'erro', 'sucesso')),
    lida BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_aulas_professor ON aulas(professor_id);
CREATE INDEX IF NOT EXISTS idx_aulas_aluno ON aulas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_aulas_data ON aulas(data_hora);
CREATE INDEX IF NOT EXISTS idx_alunos_professor ON alunos(professor_id);
CREATE INDEX IF NOT EXISTS idx_exercicios_professor ON exercicios(professor_id);
CREATE INDEX IF NOT EXISTS idx_financeiro_professor ON financeiro(professor_id);
CREATE INDEX IF NOT EXISTS idx_duvidas_professor ON duvidas(professor_id);
CREATE INDEX IF NOT EXISTS idx_duvidas_aluno ON duvidas(aluno_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_aulas_updated_at BEFORE UPDATE ON aulas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON alunos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exercicios_updated_at BEFORE UPDATE ON exercicios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exercicio_alunos_updated_at BEFORE UPDATE ON exercicio_alunos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_duvidas_updated_at BEFORE UPDATE ON duvidas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financeiro_updated_at BEFORE UPDATE ON financeiro FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercicio_alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE duvidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para professores
CREATE POLICY "Professores podem ver suas próprias aulas" ON aulas
    FOR ALL USING (auth.uid() = professor_id);

CREATE POLICY "Professores podem ver seus próprios alunos" ON alunos
    FOR ALL USING (auth.uid() = professor_id);

CREATE POLICY "Professores podem ver seus próprios exercícios" ON exercicios
    FOR ALL USING (auth.uid() = professor_id);

CREATE POLICY "Professores podem ver exercícios dos seus alunos" ON exercicio_alunos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM exercicios e 
            WHERE e.id = exercicio_alunos.exercicio_id 
            AND e.professor_id = auth.uid()
        )
    );

CREATE POLICY "Professores podem ver suas próprias dúvidas" ON duvidas
    FOR ALL USING (auth.uid() = professor_id);

CREATE POLICY "Professores podem ver seus próprios dados financeiros" ON financeiro
    FOR ALL USING (auth.uid() = professor_id);

CREATE POLICY "Usuários podem ver suas próprias notificações" ON notificacoes
    FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para alunos
CREATE POLICY "Alunos podem ver suas próprias aulas" ON aulas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.id = aulas.aluno_id
        )
    );

CREATE POLICY "Alunos podem ver suas próprias dúvidas" ON duvidas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.id = duvidas.aluno_id
        )
    );

CREATE POLICY "Alunos podem ver seus próprios exercícios" ON exercicio_alunos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.id = exercicio_alunos.aluno_id
        )
    );

-- Inserir dados de exemplo para teste
INSERT INTO alunos (professor_id, aluno_id, ativo) 
SELECT 
    'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid,
    id,
    true
FROM profiles 
WHERE professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974' 
AND tipo = 'aluno'
ON CONFLICT (professor_id, aluno_id) DO NOTHING;

-- Inserir aulas de exemplo
INSERT INTO aulas (professor_id, aluno_id, data_hora, duracao, assunto, materia, status)
SELECT 
    'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid,
    p.id,
    NOW() + (row_number() OVER ()) * INTERVAL '1 day',
    60,
    'Aula de ' || COALESCE(p.especialidade, 'Matemática'),
    COALESCE(p.especialidade, 'Matemática'),
    'agendada'
FROM profiles p
WHERE p.professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974' 
AND p.tipo = 'aluno'
LIMIT 3;

-- Inserir exercícios de exemplo
INSERT INTO exercicios (professor_id, titulo, descricao, materia, status)
VALUES 
    ('e650f5ee-747b-4574-9bfa-8e2d411c4974', 'Equações do 2º Grau', 'Resolva as equações quadráticas', 'Matemática', 'criado'),
    ('e650f5ee-747b-4574-9bfa-8e2d411c4974', 'Leis de Newton', 'Exercícios sobre as três leis de Newton', 'Física', 'criado'),
    ('e650f5ee-747b-4574-9bfa-8e2d411c4974', 'Balanceamento Químico', 'Pratique balanceamento de equações', 'Química', 'criado');

-- Inserir dados financeiros de exemplo
INSERT INTO financeiro (professor_id, aluno_id, tipo, descricao, valor, status, data_vencimento)
SELECT 
    'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid,
    p.id,
    'mensalidade',
    'Mensalidade de ' || to_char(CURRENT_DATE, 'MM/YYYY'),
    150.00,
    'pendente',
    CURRENT_DATE + INTERVAL '5 days'
FROM profiles p
WHERE p.professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974' 
AND p.tipo = 'aluno'
LIMIT 2;

COMMIT; 