
-- Platform settings table (single row for site-wide config)
CREATE TABLE public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Biotra',
  site_logo_url text DEFAULT '',
  default_theme_id text NOT NULL DEFAULT 'clean-white',
  allow_registration boolean NOT NULL DEFAULT true,
  ai_api_key text DEFAULT '',
  feature_catalog boolean NOT NULL DEFAULT true,
  feature_contact_form boolean NOT NULL DEFAULT true,
  feature_social_links boolean NOT NULL DEFAULT true,
  feature_analytics boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default row
INSERT INTO public.platform_settings (id) VALUES (gen_random_uuid());

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read platform settings (needed for public profile feature checks)
CREATE POLICY "Platform settings are publicly readable"
ON public.platform_settings FOR SELECT
USING (true);

-- Only admins can update (using a security definer function to check role)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

CREATE POLICY "Admins can update platform settings"
ON public.platform_settings FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

