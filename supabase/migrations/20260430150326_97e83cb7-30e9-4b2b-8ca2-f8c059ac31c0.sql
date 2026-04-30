
CREATE TABLE public.targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('company','agent')),
  agent_id uuid NULL,
  life_revenue_target numeric NOT NULL DEFAULT 0,
  health_revenue_target numeric NOT NULL DEFAULT 0,
  addon_revenue_target numeric NOT NULL DEFAULT 0,
  life_attach_ratio_target numeric NOT NULL DEFAULT 0,
  health_attach_ratio_target numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT targets_scope_agent_chk CHECK (
    (scope = 'company' AND agent_id IS NULL) OR
    (scope = 'agent' AND agent_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX targets_company_unique ON public.targets ((1)) WHERE scope = 'company';
CREATE UNIQUE INDEX targets_agent_unique ON public.targets (agent_id) WHERE scope = 'agent';

ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY targets_select_auth ON public.targets FOR SELECT TO authenticated USING (true);
CREATE POLICY targets_admin_all ON public.targets FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_targets_updated_at
BEFORE UPDATE ON public.targets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
