ALTER TABLE users ADD COLUMN IF NOT EXISTS
  is_admin boolean NOT NULL DEFAULT false;

-- Set yourself as admin (replace with your real user id)
-- UPDATE users SET is_admin = true WHERE email = 'your@email.com';

