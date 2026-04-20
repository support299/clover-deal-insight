DROP POLICY IF EXISTS sales_select_agent_own ON public.sales;
CREATE POLICY sales_select_all_auth ON public.sales FOR SELECT TO authenticated USING (true);