CREATE TABLE public.ghl_contacts (
  id text PRIMARY KEY,
  name text,
  email text,
  phone text,
  type text,
  location_id text,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ghl_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY ghl_contacts_admin_all ON public.ghl_contacts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER ghl_contacts_updated_at
  BEFORE UPDATE ON public.ghl_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ghl_users (
  id text PRIMARY KEY,
  name text,
  email text,
  phone text,
  type text,
  location_id text,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ghl_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY ghl_users_admin_all ON public.ghl_users
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER ghl_users_updated_at
  BEFORE UPDATE ON public.ghl_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();