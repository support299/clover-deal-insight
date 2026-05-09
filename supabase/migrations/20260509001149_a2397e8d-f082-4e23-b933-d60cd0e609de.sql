CREATE POLICY "ghl_users_select_own"
ON public.ghl_users
FOR SELECT
TO authenticated
USING (app_user_id = auth.uid());