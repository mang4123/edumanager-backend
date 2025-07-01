-- Create the duvidas table
CREATE TABLE IF NOT EXISTS public.duvidas (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    pergunta TEXT NOT NULL,
    resposta TEXT,
    respondida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    data_resposta TIMESTAMP WITH TIME ZONE,
    professor_id UUID REFERENCES public.profiles(id),
    aluno_id UUID REFERENCES public.profiles(id),
    assunto TEXT
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.duvidas ENABLE ROW LEVEL SECURITY;

-- Policy for students to read their own questions
CREATE POLICY "Students can read their own questions"
ON public.duvidas
FOR SELECT
TO authenticated
USING (auth.uid() = aluno_id);

-- Policy for students to create questions
CREATE POLICY "Students can create questions"
ON public.duvidas
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = aluno_id);

-- Policy for teachers to read questions assigned to them
CREATE POLICY "Teachers can read questions assigned to them"
ON public.duvidas
FOR SELECT
TO authenticated
USING (auth.uid() = professor_id);

-- Policy for teachers to update questions (answer them)
CREATE POLICY "Teachers can answer questions"
ON public.duvidas
FOR UPDATE
TO authenticated
USING (auth.uid() = professor_id)
WITH CHECK (auth.uid() = professor_id);

-- Grant access to authenticated users
GRANT ALL ON public.duvidas TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 