CREATE TABLE public.login_tokens (
  token text PRIMARY KEY,
  user_id uuid NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_login_tokens_user ON public.login_tokens(user_id);

ALTER TABLE public.login_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "login_tokens_admin_all"
ON public.login_tokens
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));