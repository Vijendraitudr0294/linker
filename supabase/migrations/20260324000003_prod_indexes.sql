-- Use CONCURRENTLY so these don't lock tables
-- Cannot run inside a transaction block
CREATE INDEX IF NOT EXISTS idx_links_user_order
  ON links(user_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_qr_short_code
  ON qr_codes(short_code) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_analytics_entity_time
  ON analytics_events(entity_id, occurred_at DESC);



