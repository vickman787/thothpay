-- Security hardening: citation payouts are executed server-side only (via the
-- service-role client in src/lib/payments/settle-citation.ts). These tables
-- must not be writable by ordinary authenticated users, who previously could
-- forge payment_authorizations rows and drive the old public payout endpoint.
--
-- Reads stay open where the UI legitimately needs them:
--   - landing page / ledger shows settled citations
--   - dashboards show a creator's own authorizations
--   - receipt pages show a single authorization + its settlement

-- payment_authorizations: drop blanket manage policy, keep read-only.
DROP POLICY IF EXISTS "Users can manage own payment auths" ON public.payment_authorizations;
CREATE POLICY "Payment authorizations are readable by everyone" ON public.payment_authorizations
    FOR SELECT USING (true);

-- payment_settlements: drop blanket manage policy, keep read-only.
DROP POLICY IF EXISTS "Users can manage own settlements" ON public.payment_settlements;
CREATE POLICY "Payment settlements are readable by everyone" ON public.payment_settlements
    FOR SELECT USING (true);

-- citation_decisions: never written by users; keep read-only.
DROP POLICY IF EXISTS "Users can manage own citation decisions" ON public.citation_decisions;
CREATE POLICY "Citation decisions are readable by everyone" ON public.citation_decisions
    FOR SELECT USING (true);

-- research_sessions: users may read and delete their own sessions
-- (dashboard, history), but must not create or update arbitrary sessions
-- outside the server flow. The earlier blanket public read (added to power
-- the ledger ticker) is removed too — session queries and results belong to
-- their owners.
DROP POLICY IF EXISTS "Research sessions are readable by everyone" ON public.research_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.research_sessions;
CREATE POLICY "Users can read own research sessions" ON public.research_sessions
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can delete own research sessions" ON public.research_sessions
    FOR DELETE USING (user_id = auth.uid());
