-- Add Instagram and Facebook connection fields to profiles for AutoDM
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ig_user_id TEXT,
ADD COLUMN IF NOT EXISTS ig_access_token TEXT,
ADD COLUMN IF NOT EXISTS fb_page_id TEXT;

-- Create automation_flows table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.automation_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    trigger_keyword TEXT NOT NULL,
    response_text TEXT NOT NULL,
    trigger_type TEXT NOT NULL DEFAULT 'comment', -- 'comment' or 'dm'
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.automation_flows ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own flows"
    ON public.automation_flows
    FOR ALL
    USING (auth.uid() = user_id);
