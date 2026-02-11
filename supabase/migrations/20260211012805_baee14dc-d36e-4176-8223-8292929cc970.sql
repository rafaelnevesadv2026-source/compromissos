
-- Create agendas table
CREATE TABLE public.agendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_agenda TEXT NOT NULL DEFAULT 'Minha Agenda',
  dono_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agendas ENABLE ROW LEVEL SECURITY;

-- Create shared agenda table
CREATE TABLE public.agenda_compartilhada (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agenda_id UUID NOT NULL REFERENCES public.agendas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permissao TEXT NOT NULL DEFAULT 'visualizar' CHECK (permissao IN ('visualizar', 'editar')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agenda_id, usuario_id)
);

ALTER TABLE public.agenda_compartilhada ENABLE ROW LEVEL SECURITY;

-- Add agenda_id to compromissos
ALTER TABLE public.compromissos ADD COLUMN agenda_id UUID REFERENCES public.agendas(id) ON DELETE CASCADE;
ALTER TABLE public.compromissos ADD COLUMN criado_por UUID REFERENCES auth.users(id);

-- Security definer function: check if user owns or has access to an agenda
CREATE OR REPLACE FUNCTION public.user_has_agenda_access(_user_id UUID, _agenda_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agendas WHERE id = _agenda_id AND dono_id = _user_id
    UNION ALL
    SELECT 1 FROM public.agenda_compartilhada WHERE agenda_id = _agenda_id AND usuario_id = _user_id
  )
$$;

-- Security definer: check edit permission
CREATE OR REPLACE FUNCTION public.user_can_edit_agenda(_user_id UUID, _agenda_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agendas WHERE id = _agenda_id AND dono_id = _user_id
    UNION ALL
    SELECT 1 FROM public.agenda_compartilhada WHERE agenda_id = _agenda_id AND usuario_id = _user_id AND permissao = 'editar'
  )
$$;

-- RLS for agendas: owner or shared users can see
CREATE POLICY "Owner can do all on agendas" ON public.agendas FOR ALL TO authenticated
  USING (auth.uid() = dono_id) WITH CHECK (auth.uid() = dono_id);

CREATE POLICY "Shared users can view agendas" ON public.agendas FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.agenda_compartilhada WHERE agenda_id = id AND usuario_id = auth.uid()));

-- RLS for agenda_compartilhada
CREATE POLICY "Owner can manage sharing" ON public.agenda_compartilhada FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.agendas WHERE id = agenda_id AND dono_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.agendas WHERE id = agenda_id AND dono_id = auth.uid()));

CREATE POLICY "Shared user can view own sharing" ON public.agenda_compartilhada FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

-- Update compromissos RLS to support shared agendas
DROP POLICY IF EXISTS "Users can view own compromissos" ON public.compromissos;
DROP POLICY IF EXISTS "Users can insert own compromissos" ON public.compromissos;
DROP POLICY IF EXISTS "Users can update own compromissos" ON public.compromissos;
DROP POLICY IF EXISTS "Users can delete own compromissos" ON public.compromissos;

CREATE POLICY "Users can view compromissos" ON public.compromissos FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() 
    OR (agenda_id IS NOT NULL AND public.user_has_agenda_access(auth.uid(), agenda_id))
  );

CREATE POLICY "Users can insert compromissos" ON public.compromissos FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (agenda_id IS NULL OR public.user_can_edit_agenda(auth.uid(), agenda_id))
  );

CREATE POLICY "Users can update compromissos" ON public.compromissos FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR (agenda_id IS NOT NULL AND public.user_can_edit_agenda(auth.uid(), agenda_id))
  );

CREATE POLICY "Users can delete compromissos" ON public.compromissos FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR (agenda_id IS NOT NULL AND public.user_can_edit_agenda(auth.uid(), agenda_id))
  );

-- Auto-create default agenda for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, nome)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', ''));
  
  INSERT INTO public.agendas (dono_id, nome_agenda)
  VALUES (NEW.id, 'Minha Agenda');
  
  RETURN NEW;
END;
$function$;

-- Enable realtime for compromissos (shared agenda updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.compromissos;
