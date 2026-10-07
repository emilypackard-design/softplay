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

-- 5) Self-serve account deletion (GDPR right to erasure)
-- A signed-in user calls rpc('delete_user') to delete THEIR OWN account. It runs
-- as the function owner (security definer) so it can remove the auth.users row,
-- which cascades to their profile, playbill and saves via the FKs above.
-- auth.uid() guarantees a caller can only ever delete themselves, and execute is
-- granted only to the 'authenticated' role (never anon).
create or replace function public.delete_user()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_user() from public, anon;
grant execute on function public.delete_user() to authenticated;

-- 6) Monetization: founder tier ($9.99 one-time, first 200 signups).
-- plan/stripe_customer_id/purchased_at must only ever be set by the Stripe
-- webhook (via the service-role key). The existing "own profile" RLS policy
-- lets a signed-in user UPDATE their own row (e.g. home_city) — without this
-- trigger they could also just set plan='founder' on themselves for free.
alter table public.profiles
  add column if not exists plan text not null default 'free' check (plan in ('free', 'founder')),
  add column if not exists stripe_customer_id text,
  add column if not exists purchased_at timestamptz;

create or replace function public.protect_profile_billing_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.role() <> 'service_role' then
    new.plan := old.plan;
    new.stripe_customer_id := old.stripe_customer_id;
    new.purchased_at := old.purchased_at;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_billing_fields on public.profiles;
create trigger protect_profile_billing_fields
  before update on public.profiles
  for each row execute function public.protect_profile_billing_fields();

-- 7) Comp codes: self-serve free-lifetime-access codes for beta testers.
-- No RLS policies are granted here at all (RLS is ON, zero policies = deny by
-- default for anon/authenticated) — only the /api/redeem-code route, using the
-- service-role key, is ever allowed to read or write this table. To create a
-- code for a tester, insert a row directly in the SQL Editor, e.g.:
--   insert into public.comp_codes (code, note) values ('WELCOME-JANE', 'Beta tester — Jane');
create table if not exists public.comp_codes (
  code text primary key,
  note text,
  redeemed_by uuid references auth.users (id) on delete set null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.comp_codes enable row level security;
