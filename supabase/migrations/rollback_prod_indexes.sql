-- Rollback script — run this if a migration causes issues
-- Save this BEFORE running the forward migration

DROP INDEX CONCURRENTLY IF EXISTS idx_links_user_order;
DROP INDEX CONCURRENTLY IF EXISTS idx_qr_short_code;
DROP INDEX CONCURRENTLY IF EXISTS idx_analytics_entity_time;
DROP INDEX CONCURRENTLY IF EXISTS idx_posts_scheduled;

