-- Link products to carriers (a carrier has many products)
ALTER TABLE public.products
  ADD COLUMN carrier_id uuid REFERENCES public.carriers(id) ON DELETE CASCADE;

CREATE INDEX idx_products_carrier_id ON public.products(carrier_id);

-- Store monetary value per add-on selected on a sale
ALTER TABLE public.sales
  ADD COLUMN add_on_amounts jsonb NOT NULL DEFAULT '{}'::jsonb;