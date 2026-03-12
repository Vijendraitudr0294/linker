
-- Profile page views tracking table
CREATE TABLE public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  referrer text DEFAULT '',
  country text DEFAULT ''
);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a view (public profiles)
CREATE POLICY "Anyone can insert profile views"
  ON public.profile_views FOR INSERT
  WITH CHECK (true);

-- Profile owners can read their own views
CREATE POLICY "Users can view own profile views"
  ON public.profile_views FOR SELECT
  USING (auth.uid() = profile_user_id);
