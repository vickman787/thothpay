-- Public read on the ledger so the landing page and ticker tape can show
-- real network activity to anonymous visitors (writes stay authenticated /
-- service-role only).

CREATE POLICY "Ledger is readable by everyone" ON public.payment_authorizations
    FOR SELECT USING (true);

CREATE POLICY "Research sessions are readable by everyone" ON public.research_sessions
    FOR SELECT USING (true);
