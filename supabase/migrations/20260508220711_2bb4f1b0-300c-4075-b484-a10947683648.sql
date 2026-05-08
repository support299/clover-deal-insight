CREATE POLICY ghl_contacts_select_own ON public.ghl_contacts
FOR SELECT TO authenticated
USING (
  user_id IN (SELECT id FROM public.ghl_users WHERE app_user_id = auth.uid())
);