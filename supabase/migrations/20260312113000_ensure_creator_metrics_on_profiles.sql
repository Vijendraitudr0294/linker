-- Ensure creator metrics JSON exists on profiles.
-- Safe to run multiple times.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS creator_metrics jsonb DEFAULT '{"engagement_rate":"","avg_views":"","reach":""}'::jsonb;

UPDATE public.profiles
SET creator_metrics = '{"engagement_rate":"","avg_views":"","reach":""}'::jsonb
WHERE creator_metrics IS NULL;
