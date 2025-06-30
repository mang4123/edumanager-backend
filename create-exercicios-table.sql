-- Criar tabela exercicios se não existir
CREATE TABLE IF NOT EXISTS exercicios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50), -- exercicio, apostila, video, prova, material_apoio, outro
    anexo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_exercicios_professor_id ON exercicios(professor_id);
CREATE INDEX IF NOT EXISTS idx_exercicios_created_at ON exercicios(created_at);

-- Habilitar RLS
ALTER TABLE exercicios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para professores verem apenas seus exercícios
CREATE POLICY "Professores podem ver próprios exercícios" ON exercicios
    FOR SELECT USING (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid);

CREATE POLICY "Professores podem inserir exercícios" ON exercicios
    FOR INSERT WITH CHECK (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid);

CREATE POLICY "Professores podem atualizar próprios exercícios" ON exercicios
    FOR UPDATE USING (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid);

CREATE POLICY "Professores podem deletar próprios exercícios" ON exercicios
    FOR DELETE USING (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid);

-- Política para alunos verem exercícios de seus professores
CREATE POLICY "Alunos podem ver exercícios de seus professores" ON exercicios
    FOR SELECT USING (
        professor_id IN (
            SELECT professor_id 
            FROM alunos 
            WHERE aluno_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid 
            AND ativo = true
        )
    );

-- Criar bucket no Storage para exercicios se não existir
-- (Isso precisa ser feito via interface ou API do Supabase)

COMMENT ON TABLE exercicios IS 'Tabela para armazenar exercícios e materiais criados por professores'; 