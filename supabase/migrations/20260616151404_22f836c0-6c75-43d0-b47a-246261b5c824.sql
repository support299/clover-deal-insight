CREATE TABLE IF NOT EXISTS public._auth_export (
  id uuid,
  email text,
  encrypted_password text,
  email_confirmed_at timestamptz,
  created_at timestamptz,
  last_sign_in_at timestamptz
);
GRANT ALL ON public._auth_export TO service_role;
ALTER TABLE public._auth_export ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public._populate_auth_export()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE n integer;
BEGIN
  TRUNCATE public._auth_export;
  INSERT INTO public._auth_export
  SELECT id, email, encrypted_password, email_confirmed_at, created_at, last_sign_in_at
  FROM auth.users;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;