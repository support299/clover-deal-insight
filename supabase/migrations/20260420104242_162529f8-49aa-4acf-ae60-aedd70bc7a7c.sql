DROP POLICY IF EXISTS sales_admin_modify ON public.sales;
CREATE POLICY sales_update_scoped ON public.sales
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR (has_role(auth.uid(), 'manager'::app_role) AND team_id IS NOT NULL AND team_id = current_user_team())
    OR agent_id = auth.uid()
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR (has_role(auth.uid(), 'manager'::app_role) AND team_id IS NOT NULL AND team_id = current_user_team())
    OR agent_id = auth.uid()
  );