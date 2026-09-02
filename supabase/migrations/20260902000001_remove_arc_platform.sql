-- Removes Arc House (community.arc.io) as a verifiable source platform.
--
-- The platform list is a CHECK constraint (see 20260721000000_platform_identities.sql).
-- Dropping and re-adding the constraint is idempotent: on a fresh install the
-- constraint never had 'arc' (the add_arc migration was removed), and on a
-- database where it was applied, this narrows it back down.

ALTER TABLE public.platform_identities
    DROP CONSTRAINT IF EXISTS platform_identities_platform_check;

ALTER TABLE public.platform_identities
    ADD CONSTRAINT platform_identities_platform_check
    CHECK (platform IN ('domain', 'x', 'medium', 'substack'));
