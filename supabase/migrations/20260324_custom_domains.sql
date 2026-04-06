CREATE TABLE IF NOT EXISTS custom_domains (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id)
                 ON DELETE CASCADE,
  domain       text NOT NULL UNIQUE,
  verified     boolean NOT NULL DEFAULT false,
  txt_record   text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  verified_at  timestamptz,
  -- One domain per user maximum on free plan
  CONSTRAINT one_domain_per_user UNIQUE (user_id)
);

-- Fast lookup when middleware checks incoming hostnames
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain
  ON custom_domains(domain) WHERE verified = true;

-- Fast lookup when user opens domain settings page
CREATE INDEX IF NOT EXISTS idx_custom_domains_user
  ON custom_domains(user_id);

UPDATE custom_domains
SET verified = true, verified_at = now()
WHERE user_id = (SELECT id FROM users WHERE email = 'vijendraitudr@gmail.com');
