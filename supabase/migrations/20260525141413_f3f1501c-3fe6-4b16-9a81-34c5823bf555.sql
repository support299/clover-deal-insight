-- Sales: replace overly-permissive select
DROP POLICY IF EXISTS sales_select_all_auth ON public.sales;
CREATE POLICY sales_select_scoped ON public.sales
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR agent_id = auth.uid()
    OR (
      has_role(auth.uid(), 'manager'::app_role)
      AND team_id IS NOT NULL
      AND is_team_manager(auth.uid(), team_id)
    )
  );

-- Targets: replace overly-permissive select
DROP POLICY IF EXISTS targets_select_auth ON public.targets;
CREATE POLICY targets_select_scoped ON public.targets
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR scope = 'company'
    OR agent_id = auth.uid()
    OR (
      has_role(auth.uid(), 'manager'::app_role)
      AND agent_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = targets.agent_id
          AND p.team_id IS NOT NULL
          AND is_team_manager(auth.uid(), p.team_id)
      )
    )
  );

-- Profiles: restrict manager reads to their managed teams
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_scoped ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
    OR (
      has_role(auth.uid(), 'manager'::app_role)
      AND team_id IS NOT NULL
      AND is_team_manager(auth.uid(), team_id)
    )
  );