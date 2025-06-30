
-- FASE 1: Tabela profiles (base do sistema)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  user_type public.user_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FASE 2: Tabela professores
CREATE TABLE public.professores (
  id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  area TEXT NOT NULL,
  bio TEXT,
  preco_hora DECIMAL(10,2),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FASE 3: Tabela alunos
CREATE TABLE public.alunos (
  id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  professor_id UUID NOT NULL REFERENCES public.professores(id) ON DELETE CASCADE,
  nivel TEXT,
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FASE 4: Tabela aulas
CREATE TABLE public.aulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID NOT NULL REFERENCES public.professores(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  duracao INTEGER NOT NULL DEFAULT 60,
  assunto TEXT,
  status public.aula_status NOT NULL DEFAULT 'agendada',
  observacoes TEXT,
  link_reuniao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FASE 5: Tabela materiais
CREATE TABLE public.materiais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID NOT NULL REFERENCES public.professores(id) ON DELETE CASCADE,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo public.material_type NOT NULL,
  arquivo_url TEXT,
  arquivo_nome TEXT,
  arquivo_tamanho INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FASE 6: Tabela duvidas
CREATE TABLE public.duvidas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES public.professores(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  resposta TEXT,
  respondida BOOLEAN NOT NULL DEFAULT false,
  data_pergunta TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_resposta TIMESTAMP WITH TIME ZONE
);

-- FASE 7: Tabela financeiro
CREATE TABLE public.financeiro (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID NOT NULL REFERENCES public.professores(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  aula_id UUID REFERENCES public.aulas(id) ON DELETE SET NULL,
  valor DECIMAL(10,2) NOT NULL,
  descricao TEXT,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status public.pagamento_status NOT NULL DEFAULT 'pendente',
  metodo_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FASE 8: Tabela convites
CREATE TABLE public.convites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID NOT NULL REFERENCES public.professores(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status public.convite_status NOT NULL DEFAULT 'pendente',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  usado_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FASE 9: Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duvidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convites ENABLE ROW LEVEL SECURITY;

-- FASE 10: Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- FASE 11: Políticas RLS para professores
CREATE POLICY "Professores can view own data" ON public.professores
  FOR ALL USING (auth.uid() = id);

-- FASE 12: Políticas RLS para alunos
CREATE POLICY "Alunos can view own data" ON public.alunos
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Professores can view their alunos" ON public.alunos
  FOR SELECT USING (auth.uid() = professor_id);

CREATE POLICY "Professores can manage their alunos" ON public.alunos
  FOR ALL USING (auth.uid() = professor_id);

-- FASE 13: Políticas RLS para aulas
CREATE POLICY "Users can view their aulas" ON public.aulas
  FOR SELECT USING (
    auth.uid() = professor_id OR 
    auth.uid() = aluno_id
  );

CREATE POLICY "Professores can manage aulas" ON public.aulas
  FOR ALL USING (auth.uid() = professor_id);

-- FASE 14: Políticas RLS para materiais
CREATE POLICY "Users can view relevant materiais" ON public.materiais
  FOR SELECT USING (
    auth.uid() = professor_id OR 
    auth.uid() = aluno_id OR
    (aluno_id IS NULL AND EXISTS (
      SELECT 1 FROM public.alunos a WHERE a.id = auth.uid() AND a.professor_id = materiais.professor_id
    ))
  );

CREATE POLICY "Professores can manage materiais" ON public.materiais
  FOR ALL USING (auth.uid() = professor_id);

-- FASE 15: Políticas RLS para duvidas
CREATE POLICY "Users can view their duvidas" ON public.duvidas
  FOR SELECT USING (
    auth.uid() = aluno_id OR 
    auth.uid() = professor_id
  );

CREATE POLICY "Alunos can create duvidas" ON public.duvidas
  FOR INSERT WITH CHECK (auth.uid() = aluno_id);

CREATE POLICY "Professores can update duvidas" ON public.duvidas
  FOR UPDATE USING (auth.uid() = professor_id);

-- FASE 16: Políticas RLS para financeiro
CREATE POLICY "Users can view their financeiro" ON public.financeiro
  FOR SELECT USING (
    auth.uid() = professor_id OR 
    auth.uid() = aluno_id
  );

CREATE POLICY "Professores can manage financeiro" ON public.financeiro
  FOR ALL USING (auth.uid() = professor_id);

-- FASE 17: Políticas RLS para convites
CREATE POLICY "Professores can manage their convites" ON public.convites
  FOR ALL USING (auth.uid() = professor_id);

-- FASE 18: Atualizar função handle_new_user para usar a nova estrutura
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log para debugging
  RAISE LOG 'Creating profile for user: %, email: %, user_type: %', 
    NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'user_type', 'student');
  
  -- Inserir perfil
  INSERT INTO public.profiles (id, name, email, user_type, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'user_type')::public.user_type, 'student'::public.user_type),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  );
  
  -- Se for professor, criar registro na tabela professores
  IF COALESCE(NEW.raw_user_meta_data->>'user_type', 'student') = 'teacher' THEN
    RAISE LOG 'Creating teacher record for user: %', NEW.id;
    
    INSERT INTO public.professores (id, area)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'area', 'Não informado')
    );
  END IF;
  
  RAISE LOG 'Successfully created user profile and related records for: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RAISE;
END;
$$;

-- FASE 19: Função para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- FASE 20: Trigger para updated_at nas tabelas que possuem essa coluna
CREATE TRIGGER profiles_updated_at 
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER aulas_updated_at 
  BEFORE UPDATE ON public.aulas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
