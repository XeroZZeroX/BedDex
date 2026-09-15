-- ============================================================
-- BedDex — Schéma Supabase
-- À exécuter dans : Supabase Dashboard → SQL Editor
-- ============================================================

-- Table profiles
create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  pseudo        text not null check (char_length(pseudo) between 2 and 20),
  genre         text not null check (genre in ('H', 'F')),
  date_rencontre date not null,
  note_globale  numeric(3,1) not null check (note_globale between 1 and 10),
  criteres      jsonb not null default '{}',
  tags          text[] not null default '{}',
  commentaires_prives text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Index pour accélérer les requêtes par user
create index if not exists profiles_user_id_idx on public.profiles(user_id);

-- Mise à jour automatique de updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security : chaque user ne voit QUE ses données
-- ============================================================
alter table public.profiles enable row level security;

create policy "Users can select own profiles"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profiles"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profiles"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own profiles"
  on public.profiles for delete
  using (auth.uid() = user_id);

