alter table public.platform_settings
add column if not exists category_label_overrides jsonb not null default '{}'::jsonb;

alter table public.platform_settings
add column if not exists item_type_label_overrides jsonb not null default '{}'::jsonb;

