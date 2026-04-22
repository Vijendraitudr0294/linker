alter table public.platform_settings
add column if not exists checkout_step_labels jsonb not null default '{}'::jsonb;

alter table public.platform_settings
add column if not exists cta_label_overrides jsonb not null default '{}'::jsonb;

