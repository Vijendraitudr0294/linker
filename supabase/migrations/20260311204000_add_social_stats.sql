
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS social_stats jsonb DEFAULT '{"ig_followers": "", "fb_likes": "", "tiktok_followers": "", "youtube_subs": ""}'::jsonb;
