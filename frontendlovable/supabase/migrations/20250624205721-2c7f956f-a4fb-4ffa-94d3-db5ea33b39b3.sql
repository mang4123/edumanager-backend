
-- Habilitar RLS nas tabelas necessárias
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela aulas
CREATE POLICY "Professores podem ver suas aulas" 
  ON public.aulas 
  FOR SELECT 
  USING (auth.uid() = professor_id);

CREATE POLICY "Alunos podem ver suas aulas" 
  ON public.aulas 
  FOR SELECT 
  USING (auth.uid() = aluno_id);

CREATE POLICY "Professores podem criar aulas" 
  ON public.aulas 
  FOR INSERT 
  WITH CHECK (auth.uid() = professor_id);

CREATE POLICY "Professores podem atualizar suas aulas" 
  ON public.aulas 
  FOR UPDATE 
  USING (auth.uid() = professor_id);

CREATE POLICY "Professores podem deletar suas aulas" 
  ON public.aulas 
  FOR DELETE 
  USING (auth.uid() = professor_id);

-- Políticas para a tabela alunos
CREATE POLICY "Professores podem ver seus alunos" 
  ON public.alunos 
  FOR SELECT 
  USING (auth.uid() = professor_id);

CREATE POLICY "Alunos podem ver seu próprio perfil" 
  ON public.alunos 
  FOR SELECT 
  USING (auth.uid() = id);

-- Políticas para a tabela professores
CREATE POLICY "Professores podem ver seu próprio perfil" 
  ON public.professores 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Todos podem ver professores ativos" 
  ON public.professores 
  FOR SELECT 
  USING (ativo = true);
