
-- Add-ons catalog table
CREATE TABLE public.add_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.add_ons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "add_ons_select_auth" ON public.add_ons FOR SELECT TO authenticated USING (true);
CREATE POLICY "add_ons_admin_all" ON public.add_ons FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Lead sources catalog table
CREATE TABLE public.lead_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lead_sources_select_auth" ON public.lead_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "lead_sources_admin_all" ON public.lead_sources FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed defaults
INSERT INTO public.add_ons (name) VALUES
  ('Dental'), ('Vision'), ('Accident'), ('Critical Illness'), ('Life')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.lead_sources (name) VALUES
  ('Direct'), ('Referral'), ('Online'), ('Broker Network'), ('Cold Call'), ('Social Media')
ON CONFLICT (name) DO NOTHING;

-- Multi-manager join table
CREATE TABLE public.team_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);
ALTER TABLE public.team_managers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_managers_select_auth" ON public.team_managers FOR SELECT TO authenticated USING (true);
CREATE POLICY "team_managers_admin_all" ON public.team_managers FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Backfill from existing single manager_id on teams
INSERT INTO public.team_managers (team_id, user_id)
SELECT id, manager_id FROM public.teams WHERE manager_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Helper: is the user a manager of the given team?
CREATE OR REPLACE FUNCTION public.is_team_manager(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_managers
    WHERE user_id = _user_id AND team_id = _team_id
  )
$$;

-- Replace sales_update_scoped to use multi-manager check
DROP POLICY IF EXISTS sales_update_scoped ON public.sales;
CREATE POLICY sales_update_scoped ON public.sales
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'manager'::app_role) AND team_id IS NOT NULL AND public.is_team_manager(auth.uid(), team_id))
  OR (agent_id = auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'manager'::app_role) AND team_id IS NOT NULL AND public.is_team_manager(auth.uid(), team_id))
  OR (agent_id = auth.uid())
);

-- Make deal_size nullable so the field can be removed from the form
ALTER TABLE public.sales ALTER COLUMN deal_size DROP NOT NULL;
