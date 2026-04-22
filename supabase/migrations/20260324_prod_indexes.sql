-- Use CONCURRENTLY so these don't lock tables
-- Cannot run inside a transaction block
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_links_user_order
  ON links(user_id, order_index);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_qr_short_code
  ON qr_codes(short_code) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_entity_time
  ON analytics_events(entity_id, occurred_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_scheduled
  ON social_posts(scheduled_at) WHERE status = 'scheduled';

