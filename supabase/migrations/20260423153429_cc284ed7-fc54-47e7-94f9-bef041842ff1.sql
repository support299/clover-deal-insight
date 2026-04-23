ALTER TABLE public.products DROP CONSTRAINT products_name_key;
ALTER TABLE public.products ADD CONSTRAINT products_carrier_name_unique UNIQUE (carrier_id, name);