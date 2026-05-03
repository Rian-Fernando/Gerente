-- Gerente — initial schema
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.

-- 1. Tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  completed boolean not null default false,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  category text not null default 'personal',
  due_date date,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  position double precision not null default 0
);

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_user_category_idx on public.tasks(user_id, category);

-- 2. Row Level Security
alter table public.tasks enable row level security;

drop policy if exists "Users can view their own tasks" on public.tasks;
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own tasks" on public.tasks;
create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own tasks" on public.tasks;
create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own tasks" on public.tasks;
create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- 3. Enable realtime so the client picks up cross-device changes
alter publication supabase_realtime add table public.tasks;
