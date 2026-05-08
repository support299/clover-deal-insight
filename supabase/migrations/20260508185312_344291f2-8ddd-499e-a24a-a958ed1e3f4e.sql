CREATE TABLE public.ghl_webhook_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status text NOT NULL,
  type text,
  entity_id text,
  entity_table text,
  action text,
  error text,
  payload jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_ghl_webhook_logs_created_at ON public.ghl_webhook_logs (created_at DESC);
CREATE INDEX idx_ghl_webhook_logs_status ON public.ghl_webhook_logs (status);
CREATE INDEX idx_ghl_webhook_logs_entity_id ON public.ghl_webhook_logs (entity_id);

ALTER TABLE public.ghl_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ghl_webhook_logs_admin_all"
ON public.ghl_webhook_logs
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));