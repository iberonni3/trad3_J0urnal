-- Journal tables for trad3_J0urnal
-- Run inside the Supabase SQL editor or via supabase CLI.

-- Enable UUID extension if it is not already enabled
create extension if not exists "uuid-ossp";

create table if not exists public.journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  trade_id uuid,
  date date not null,
  title text not null,
  content text not null,
  tags text[] default '{}',
  mood text default 'neutral',
  performance text default 'average',
  pnl numeric default 0,
  trades_count integer default 0,
  lessons text default '',
  improvements text default '',
  hidden boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.journal_lessons (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  category text not null,
  content text not null,
  tags text[] default '{}',
  date_added date not null default current_date,
  importance text default 'medium',
  times_applied integer default 0,
  success_rate integer default 0,
  related_entries text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.journal_entries enable row level security;
alter table public.journal_lessons enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'journal_entries'
      and policyname = 'Allow journal entry access to owners'
  ) then
    create policy "Allow journal entry access to owners"
      on public.journal_entries
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'journal_lessons'
      and policyname = 'Allow journal lesson access to owners'
  ) then
    create policy "Allow journal lesson access to owners"
      on public.journal_lessons
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

