-- 1. Create the scalable raw events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id          BIGSERIAL,
  event_type  TEXT NOT NULL CHECK (event_type IN ('link_click', 'qr_scan', 'post_view')),
  entity_id   UUID NOT NULL, 
  user_id     UUID NOT NULL, 
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  properties  JSONB, 
  PRIMARY KEY (id, occurred_at)
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN
    PERFORM create_hypertable('analytics_events', 'occurred_at', if_not_exists => TRUE);
  END IF;
EXCEPTION WHEN OTHERS THEN END $$;

CREATE INDEX IF NOT EXISTS idx_analytics_entity_time ON analytics_events(entity_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user_time ON analytics_events(user_id, occurred_at DESC);

-- 2. Create the fast aggregate rollup table
CREATE TABLE IF NOT EXISTS analytics_daily (
  entity_id   UUID NOT NULL,
  event_type  TEXT NOT NULL,
  event_date  DATE NOT NULL,
  event_count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (entity_id, event_type, event_date)
);

-- 3. Upsert Aggregator Function
CREATE OR REPLACE FUNCTION refresh_analytics_aggregates()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO analytics_daily (entity_id, event_type, event_date, event_count)
  SELECT entity_id, event_type, occurred_at::date, COUNT(*)::INT
  FROM analytics_events
  WHERE occurred_at >= (now() - interval '2 days')
  GROUP BY 1, 2, 3
  ON CONFLICT (entity_id, event_type, event_date) DO UPDATE
    SET event_count = EXCLUDED.event_count;
END;
$$;

-- Drop legacy hardcoded locked sequences
ALTER TABLE links DROP COLUMN IF EXISTS clicks;
ALTER TABLE qr_codes DROP COLUMN IF EXISTS scans;

