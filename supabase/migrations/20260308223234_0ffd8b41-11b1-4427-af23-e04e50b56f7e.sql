
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_prefs jsonb NOT NULL DEFAULT '{"messages": true, "orders": true, "views": true}'::jsonb;
