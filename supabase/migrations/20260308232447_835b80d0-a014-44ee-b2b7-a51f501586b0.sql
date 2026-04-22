
-- Drop all existing restrictive policies
DROP POLICY IF EXISTS "Appearance settings are publicly viewable" ON public.appearance_settings;
DROP POLICY IF EXISTS "Users can insert own appearance" ON public.appearance_settings;
DROP POLICY IF EXISTS "Users can update own appearance" ON public.appearance_settings;
DROP POLICY IF EXISTS "Admins can update any appearance" ON public.appearance_settings;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Appearance settings are publicly viewable"
ON public.appearance_settings
FOR SELECT
USING (true);

CREATE POLICY "Users can insert own appearance"
ON public.appearance_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appearance"
ON public.appearance_settings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any appearance"
ON public.appearance_settings
FOR UPDATE
USING (public.is_admin(auth.uid()));

