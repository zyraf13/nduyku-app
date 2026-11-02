-- Nduyku v2 — Supabase schema
-- Jalankan di Supabase Dashboard → SQL Editor (sekali jalan)

-- ===== Allowlist pasangan (cuma 2 email ini yang boleh masuk) =====
create table if not exists public.allowed_users (
  email text primary key,
  label text not null default ''          -- "Dia" / "Kamu"
);
insert into public.allowed_users (email, label) values
  ('salmanalfaris543@gmail.com', 'p1')      -- ganti sesuai email kalian
  -- , ('pasangan@kamu.com', 'p2')           -- tambah email pasangan di sini
on conflict do nothing;

-- ===== Kenangan (foto/video) =====
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  name text not null,
  mime text not null,
  path text not null,                      -- path di storage bucket
  created_at timestamptz not null default now()
);

-- ===== Skor & stats =====
create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  game text not null check (game in ('tictactoe','memory')),
  winner text not null check (winner in ('p1','p2','draw')),
  created_at timestamptz not null default now()
);

create table if not exists public.stats (
  id int primary key default 1 check (id = 1),   -- baris tunggal
  p1_wins int not null default 0,
  p2_wins int not null default 0,
  draws int not null default 0,
  love_points int not null default 0,
  updated_at timestamptz not null default now()
);
insert into public.stats (id) values (1) on conflict do nothing;

-- increment atomik dipanggil server-side (service role) lewat RPC
create or replace function public.bump_stat(winner text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.stats set
    p1_wins = p1_wins + case when winner = 'p1' then 1 else 0 end,
    p2_wins = p2_wins + case when winner = 'p2' then 1 else 0 end,
    draws   = draws   + case when winner = 'draw' then 1 else 0 end,
    love_points = love_points + 1,
    updated_at = now()
  where id = 1;
end $$;

create or replace function public.add_love(pts int)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.stats set love_points = love_points + pts, updated_at = now() where id = 1;
end $$;

-- ===== RLS =====
alter table public.allowed_users enable row level security;
alter table public.memories      enable row level security;
alter table public.game_results  enable row level security;
alter table public.stats         enable row level security;

-- allowlist boleh dibaca siapa pun yang sudah login
create policy "read allowlist" on public.allowed_users
  for select to authenticated using (true);

create policy "read memories" on public.memories
  for select to authenticated using (
    exists (select 1 from public.allowed_users a where a.email = auth.email())
  );
create policy "insert memories" on public.memories
  for insert to authenticated with check (
    user_email = auth.email()
    and exists (select 1 from public.allowed_users a where a.email = auth.email())
  );
create policy "delete memories" on public.memories
  for delete to authenticated using (
    exists (select 1 from public.allowed_users a where a.email = auth.email())
  );

create policy "read results" on public.game_results
  for select to authenticated using (
    exists (select 1 from public.allowed_users a where a.email = auth.email())
  );
create policy "insert results" on public.game_results
  for insert to authenticated with check (
    exists (select 1 from public.allowed_users a where a.email = auth.email())
  );

create policy "read stats" on public.stats
  for select to authenticated using (
    exists (select 1 from public.allowed_users a where a.email = auth.email())
  );
-- update langsung DITUTUP — cuma lewat RPC bump_stat/add_love

grant execute on function public.bump_stat(text) to authenticated;
grant execute on function public.add_love(int) to authenticated;

-- ===== Storage bucket =====
insert into storage.buckets (id, name, public)
values ('memories', 'memories', false)
on conflict (id) do nothing;

create policy "read memories object" on storage.objects
  for select to authenticated using (
    bucket_id = 'memories'
    and exists (select 1 from public.allowed_users a where a.email = auth.email())
  );
create policy "upload memories object" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'memories'
    and exists (select 1 from public.allowed_users a where a.email = auth.email())
  );
create policy "delete memories object" on storage.objects
  for delete to authenticated using (
    bucket_id = 'memories'
    and exists (select 1 from public.allowed_users a where a.email = auth.email())
  );
