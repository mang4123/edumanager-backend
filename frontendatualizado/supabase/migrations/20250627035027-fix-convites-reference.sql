-- Remover a constraint antiga
ALTER TABLE public.convites
DROP CONSTRAINT IF EXISTS convites_professor_id_fkey;

-- Adicionar a nova constraint referenciando profiles
ALTER TABLE public.convites
ADD CONSTRAINT convites_professor_id_fkey
FOREIGN KEY (professor_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE; 