create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  slug text not null unique,
  category text not null default 'Lead',
  description text,
  schema_json jsonb not null default '{"fields":[]}'::jsonb,
  style_json jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  source text not null default 'public',
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_forms_user_id on public.forms(user_id);
create index if not exists idx_forms_slug on public.forms(slug);
create index if not exists idx_forms_published on public.forms(published, status);
create index if not exists idx_form_submissions_form_id on public.form_submissions(form_id);
create index if not exists idx_form_submissions_created_at on public.form_submissions(created_at desc);

alter table public.forms enable row level security;
alter table public.form_submissions enable row level security;

drop policy if exists "Users can read own forms" on public.forms;
create policy "Users can read own forms"
  on public.forms
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own forms" on public.forms;
create policy "Users can insert own forms"
  on public.forms
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own forms" on public.forms;
create policy "Users can update own forms"
  on public.forms
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read submissions for own forms" on public.form_submissions;
create policy "Users can read submissions for own forms"
  on public.form_submissions
  for select
  using (
    exists (
      select 1 from public.forms f
      where f.id = form_id and f.user_id = auth.uid()
    )
  );

