
CREATE OR REPLACE FUNCTION public.current_ghl_user_ids()
RETURNS SETOF text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.ghl_users WHERE app_user_id = auth.uid()
$$;

DROP POLICY IF EXISTS ghl_contacts_select_own ON public.ghl_contacts;

CREATE POLICY ghl_contacts_select_own
ON public.ghl_contacts
FOR SELECT
TO authenticated
USING (user_id IN (SELECT public.current_ghl_user_ids()));
