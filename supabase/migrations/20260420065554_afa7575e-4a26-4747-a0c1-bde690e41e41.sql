-- Carriers managed by admins
CREATE TABLE public.carriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carriers_select_auth" ON public.carriers FOR SELECT TO authenticated USING (true);
CREATE POLICY "carriers_admin_all" ON public.carriers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Products managed by admins
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select_auth" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "products_admin_all" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed initial carriers and products
INSERT INTO public.carriers (name) VALUES
  ('UnitedHealth'),('Anthem'),('Cigna'),('Aetna'),('Humana'),
  ('Blue Cross Blue Shield'),('Kaiser Permanente'),('Molina Healthcare')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.products (name) VALUES
  ('Medical'),('Dental-only'),('Vision-only'),
  ('Medical + Dental Bundle'),('Medical + Dental + Vision Bundle'),('Short-term Medical')
ON CONFLICT (name) DO NOTHING;

-- Allow admins to delete profiles (cascades via auth.users would need admin API; we provide profile delete here)
CREATE POLICY "profiles_admin_delete" ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));