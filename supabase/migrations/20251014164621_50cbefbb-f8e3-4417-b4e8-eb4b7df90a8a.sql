-- Adicionar campo champion_id à tabela championships
ALTER TABLE public.championships 
ADD COLUMN champion_id uuid REFERENCES public.teams(id) ON DELETE SET NULL;