create table if not exists public.form_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  form_id text,
  submission_id text,
  field_id text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  storage_provider text not null default 'r2',
  storage_key text not null,
  public_url text not null,
  uploaded_by text,
  created_at timestamptz not null default now()
);

create index if not exists idx_form_uploads_user_id on public.form_uploads(user_id);
create index if not exists idx_form_uploads_form_id on public.form_uploads(form_id);
create index if not exists idx_form_uploads_submission_id on public.form_uploads(submission_id);
create index if not exists idx_form_uploads_created_at on public.form_uploads(created_at desc);

alter table public.form_uploads enable row level security;

drop policy if exists "Users can read their own form uploads" on public.form_uploads;
create policy "Users can read their own form uploads"
  on public.form_uploads
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own form uploads" on public.form_uploads;
create policy "Users can insert their own form uploads"
  on public.form_uploads
  for insert
  with check (auth.uid() = user_id);

