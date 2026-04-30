CREATE TABLE public.expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL,
  amount numeric NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Agents see only their own expenses; admins/managers see all
CREATE POLICY "expenses_select_own_or_privileged"
ON public.expenses FOR SELECT TO authenticated
USING (
  agent_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- Agents insert only as themselves
CREATE POLICY "expenses_insert_self"
ON public.expenses FOR INSERT TO authenticated
WITH CHECK (agent_id = auth.uid());

-- Admins and managers can update any; agents can update their own
CREATE POLICY "expenses_update_scoped"
ON public.expenses FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR agent_id = auth.uid()
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR agent_id = auth.uid()
);

-- Admins and managers can delete; agents can delete their own
CREATE POLICY "expenses_delete_scoped"
ON public.expenses FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR agent_id = auth.uid()
);

CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_expenses_agent_id ON public.expenses(agent_id);
CREATE INDEX idx_expenses_dates ON public.expenses(start_date, end_date);