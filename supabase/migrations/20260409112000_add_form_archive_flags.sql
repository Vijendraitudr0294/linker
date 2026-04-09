alter table public.forms
  add column if not exists archived boolean not null default false,
  add column if not exists deleted_at timestamptz;

create index if not exists idx_forms_archived on public.forms(archived);
