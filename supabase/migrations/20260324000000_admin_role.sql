ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  is_admin boolean NOT NULL DEFAULT false;

-- Note: We already have public.profiles.role which handles admin status.
-- This is_admin column is being added to the profiles table as requested by the migration.

-- Set yourself as admin (replace with your real user id)
-- UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';

