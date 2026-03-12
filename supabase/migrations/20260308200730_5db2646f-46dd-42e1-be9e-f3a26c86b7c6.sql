
-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to update any links
CREATE POLICY "Admins can update any links"
ON public.links FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to update any appearance
CREATE POLICY "Admins can update any appearance"
ON public.appearance_settings FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to read all links (including disabled)
CREATE POLICY "Admins can read all links"
ON public.links FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Add email notification settings to platform_settings
ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS notify_order_email text DEFAULT '',
  ADD COLUMN IF NOT EXISTS notify_contact_email text DEFAULT '',
  ADD COLUMN IF NOT EXISTS notify_low_stock_email text DEFAULT '',
  ADD COLUMN IF NOT EXISTS enable_order_notifications boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS enable_contact_notifications boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS enable_low_stock_notifications boolean NOT NULL DEFAULT true;
