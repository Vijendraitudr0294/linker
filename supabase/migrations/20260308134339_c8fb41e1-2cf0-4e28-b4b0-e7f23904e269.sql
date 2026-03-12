
-- Catalog analytics events table
CREATE TABLE public.catalog_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.catalog_items(id) ON DELETE CASCADE,
  profile_user_id uuid NOT NULL,
  event_type text NOT NULL DEFAULT 'view',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.catalog_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics events (public profiles)
CREATE POLICY "Anyone can insert catalog analytics"
  ON public.catalog_analytics FOR INSERT
  WITH CHECK (true);

-- Owners can view their analytics
CREATE POLICY "Users can view own catalog analytics"
  ON public.catalog_analytics FOR SELECT
  USING (auth.uid() = profile_user_id);

-- Index for fast queries
CREATE INDEX idx_catalog_analytics_profile ON public.catalog_analytics(profile_user_id, created_at);
CREATE INDEX idx_catalog_analytics_item ON public.catalog_analytics(item_id, event_type);
