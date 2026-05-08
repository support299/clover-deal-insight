ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.ghl_users ADD COLUMN IF NOT EXISTS app_user_id uuid;
CREATE INDEX IF NOT EXISTS ghl_users_app_user_id_idx ON public.ghl_users(app_user_id);