-- Allow the registration pipeline (running as an authenticated user) to insert
-- extracted chunks for a source they own. Without an INSERT policy, RLS
-- silently blocks the write and sources end up with no retrievable content.

CREATE POLICY "Users can insert chunks for own sources" ON public.source_chunks
    FOR INSERT TO authenticated
    WITH CHECK (
        source_id IN (
            SELECT id FROM public.sources WHERE creator_id IN (
                SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
            )
        )
    );
