-- softplay V1.5 schema — run once in Supabase SQL Editor.
-- Tables for per-user memory, with Row-Level Security so each
-- signed-in user can only ever see and edit their own rows.

-- 1) Profiles: one row per user
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  home_city text,
  created_at timestamptz not null default now()
);

-- 2) Playbills: one row per user holding the whole Playbill as JSON
--    (same shape as the app's PlaybillData / localStorage 'lastPlaybill')
create table if not exists public.playbills (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- 3) Saves: Playground items (hearts and pins)
create table if not exists public.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id text,                          -- original localStorage id, for import dedupe
  type text not null check (type in ('heart', 'pin')),
  title text not null,
  emoji text,
  pitch text,
  city text not null,
  created_at timestamptz not null default now()
);
create index if not exists saves_user_idx on public.saves (user_id);
-- NOTE: must be a FULL unique index (not partial) so upserts can target it.
-- (Postgres allows multiple NULL client_ids under a unique index, so this is safe.)
create unique index if not exists saves_user_client_idx
  on public.saves (user_id, client_id);

-- 4) Row-Level Security: ON for everything, owner-only policies
alter table public.profiles enable row level security;
alter table public.playbills enable row level security;
alter table public.saves enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own playbill" on public.playbills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own saves" on public.saves
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
