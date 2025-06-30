
-- Criar tabela para armazenar convites de alunos
CREATE TABLE IF NOT EXISTS public.convites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  valor_aula DECIMAL(10,2),
  data_vencimento DATE,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito', 'expirado')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela convites
ALTER TABLE public.convites ENABLE ROW LEVEL SECURITY;

-- Política para professores verem apenas seus próprios convites
CREATE POLICY "Professores podem ver seus próprios convites"
  ON public.convites
  FOR SELECT
  USING (auth.uid() = professor_id);

-- Política para professores criarem convites
CREATE POLICY "Professores podem criar convites"
  ON public.convites
  FOR INSERT
  WITH CHECK (auth.uid() = professor_id);

-- Política para professores atualizarem seus próprios convites
CREATE POLICY "Professores podem atualizar seus próprios convites"
  ON public.convites
  FOR UPDATE
  USING (auth.uid() = professor_id);

-- Política para professores excluírem seus próprios convites
CREATE POLICY "Professores podem excluir seus próprios convites"
  ON public.convites
  FOR DELETE
  USING (auth.uid() = professor_id);

-- Política para permitir leitura pública de convites válidos (necessário para registro)
CREATE POLICY "Convites válidos podem ser lidos publicamente"
  ON public.convites
  FOR SELECT
  USING (status = 'pendente' AND expires_at > now());

-- Trigger para atualizar updated_at
CREATE OR REPLACE TRIGGER update_convites_updated_at
  BEFORE UPDATE ON public.convites
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função para validar e aceitar convite durante o registro
CREATE OR REPLACE FUNCTION public.accept_invite(invite_token TEXT, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  convite_record RECORD;
BEGIN
  -- Buscar convite válido
  SELECT * INTO convite_record
  FROM public.convites
  WHERE token = invite_token
    AND status = 'pendente'
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Marcar convite como aceito
  UPDATE public.convites
  SET status = 'aceito', updated_at = now()
  WHERE token = invite_token;
  
  -- Criar relacionamento professor-aluno
  INSERT INTO public.alunos (id, professor_id, nivel, observacoes)
  VALUES (
    user_id,
    convite_record.professor_id,
    'Iniciante',
    COALESCE(convite_record.observacoes, '')
  );
  
  RETURN TRUE;
END;
$$;
