-- Trading accounts table and trade associations
-- Execute in Supabase SQL editor or via supabase CLI

create extension if not exists "uuid-ossp";

create table if not exists public.accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  broker text default '',
  initial_balance numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.accounts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'accounts'
      and policyname = 'Allow account access to owners'
  ) then
    create policy "Allow account access to owners"
      on public.accounts
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Ensure trades table has a nullable account reference
alter table public.trades
  add column if not exists account_id uuid references public.accounts (id);

-- Optional: backfill existing rows with NULL (already default)
update public.trades
set account_id = account_id
where account_id is null;

