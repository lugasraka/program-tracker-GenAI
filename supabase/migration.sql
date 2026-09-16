-- TIM Program Hub — team sharing schema
-- Run in Supabase SQL editor (Project → SQL Editor → New query).

create table if not exists public.syntheses (
  id uuid primary key default gen_random_uuid(),
  program_name text not null default 'Untitled program',
  result jsonb not null,
  created_by uuid not null default auth.uid() references auth.users on delete cascade,
  author_email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.syntheses enable row level security;

-- Shared-workspace model: any signed-in member reads/updates all; deletes own.
drop policy if exists "team read" on public.syntheses;
drop policy if exists "team insert" on public.syntheses;
drop policy if exists "team update" on public.syntheses;
drop policy if exists "team delete" on public.syntheses;

create policy "team read"   on public.syntheses for select to authenticated using (true);
create policy "team insert" on public.syntheses for insert to authenticated with check (auth.uid() = created_by);
create policy "team update" on public.syntheses for update to authenticated using (true);
create policy "team delete" on public.syntheses for delete to authenticated using (auth.uid() = created_by);

-- Keep updated_at fresh on every update.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists syntheses_touch on public.syntheses;
create trigger syntheses_touch
  before update on public.syntheses
  for each row execute function public.touch_updated_at();

-- Idempotent patch: ensure created_by defaults to the requesting user even on
-- tables created before this column default existed. (Fixes "Save failed" —
-- inserts were rejected because created_by was NOT NULL with no default and
-- the client never sends it.)
alter table public.syntheses alter column created_by set default auth.uid();
notify pgrst, 'reload schema';
