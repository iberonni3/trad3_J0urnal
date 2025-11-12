-- Analysis entries + storage
-- Run in Supabase SQL editor or supabase CLI

create extension if not exists "uuid-ossp";

create table if not exists public.analysis_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  type text not null check (type in ('forecast', 'weekly')),
  note text not null,
  image_url text,
  image_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.analysis_entries enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'analysis_entries'
      and policyname = 'Allow analysis access to owners'
  ) then
    create policy "Allow analysis access to owners"
      on public.analysis_entries
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

