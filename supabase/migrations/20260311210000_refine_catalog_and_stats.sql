
-- Add media column to catalog_items for multiple images/videos
ALTER TABLE public.catalog_items 
ADD COLUMN IF NOT EXISTS media jsonb DEFAULT '[]'::jsonb;

-- Extend social_stats to include engagement or any other creator metrics if needed
-- Actually, the user asked for engagement, let's ensure we have a place for it.
-- We can add it to the social_stats JSONB we created earlier or create a new one.
-- Let's just update the profile to have more comprehensive creator fields.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS creator_metrics jsonb DEFAULT '{"engagement_rate": "", "avg_views": "", "reach": ""}'::jsonb;
