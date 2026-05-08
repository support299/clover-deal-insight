
CREATE TABLE public.ghl_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  location_id text,
  company_id text,
  user_type text,
  scope text,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ghl_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ghl_tokens_admin_all"
ON public.ghl_tokens
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_ghl_tokens_updated_at
BEFORE UPDATE ON public.ghl_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
