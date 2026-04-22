-- Dynamic UI configuration buckets for admin-controlled marketplace catalogs.
-- Safe migration: only adds optional jsonb columns.
ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS link_template_categories jsonb,
  ADD COLUMN IF NOT EXISTS theme_categories jsonb,
  ADD COLUMN IF NOT EXISTS theme_presets jsonb,
  ADD COLUMN IF NOT EXISTS niche_templates jsonb,
  ADD COLUMN IF NOT EXISTS demo_catalog_packs jsonb;

