-- research_sessions.result was referenced by the API but never existed in the
-- schema, so the "mark session completed" update silently failed and every
-- session stayed 'active' (making "Answers served" read 0).

ALTER TABLE public.research_sessions ADD COLUMN IF NOT EXISTS result JSONB;
