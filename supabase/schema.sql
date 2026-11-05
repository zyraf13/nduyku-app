-- Nduyku v2 — Supabase schema
-- Jalankan di Supabase Dashboard → SQL Editor (sekali jalan)
-- Mode: SEMUA email bisa daftar & lihat, asal login password (auth Supabase)

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

-- increment atomik lewat RPC
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

-- ===== RLS — semua user yang sudah login boleh lihat =====
alter table public.memories      enable row level security;
alter table public.game_results  enable row level security;
alter table public.stats         enable row level security;

create policy "read memories" on public.memories
  for select to authenticated using (true);
create policy "insert memories" on public.memories
  for insert to authenticated with check (user_email = auth.email());
create policy "delete memories" on public.memories
  for delete to authenticated
  using (user_email = auth.email());

create policy "read results" on public.game_results
  for select to authenticated using (true);
create policy "insert results" on public.game_results
  for insert to authenticated with check (true);

create policy "read stats" on public.stats
  for select to authenticated using (true);
-- update langsung DITUTUP — cuma lewat RPC bump_stat/add_love

grant execute on function public.bump_stat(text) to authenticated;
grant execute on function public.add_love(int) to authenticated;
revoke execute on function public.bump_stat(text) from anon;
revoke execute on function public.add_love(int) from anon;

-- ===== Storage bucket =====
insert into storage.buckets (id, name, public)
values ('memories', 'memories', false)
on conflict (id) do nothing;

create policy "read memories object" on storage.objects
  for select to authenticated using (bucket_id = 'memories');
create policy "upload memories object" on storage.objects
  for insert to authenticated with check (bucket_id = 'memories');
create policy "delete memories object" on storage.objects
  for delete to authenticated
  using (bucket_id = 'memories' and owner = auth.uid());

-- ===== v2.1 (2026-11-05) =====
ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS frame_style TEXT DEFAULT 'polaroid';

CREATE TABLE IF NOT EXISTS couple_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_email TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INT NOT NULL,
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE couple_quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read quizzes" ON couple_quizzes;
DROP POLICY IF EXISTS "insert quizzes" ON couple_quizzes;
DROP POLICY IF EXISTS "update quizzes" ON couple_quizzes;
CREATE POLICY "read quizzes" ON couple_quizzes FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert quizzes" ON couple_quizzes FOR INSERT TO authenticated WITH CHECK (creator_email = auth.email());
CREATE POLICY "update quizzes" ON couple_quizzes FOR UPDATE TO authenticated USING (creator_email = auth.email());

-- jawab kuis: correct_index dicek di server (RLS SELECT tidak membocorkan jawaban)
CREATE OR REPLACE FUNCTION answer_quiz(qid uuid, guess int)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE q record; ok boolean;
BEGIN
  SELECT * INTO q FROM couple_quizzes WHERE id = qid AND NOT is_answered;
  IF q.id IS NULL THEN RETURN FALSE; END IF;
  ok := (guess = q.correct_index);
  IF ok THEN
    UPDATE couple_quizzes SET is_answered = true WHERE id = qid;
    UPDATE stats SET love_points = love_points + 5, updated_at = now() WHERE id = 1;
  END IF;
  RETURN ok;
END $$;
GRANT EXECUTE ON FUNCTION answer_quiz(uuid, int) TO authenticated;
REVOKE EXECUTE ON FUNCTION answer_quiz(uuid, int) FROM anon;

-- GAP-1: pts harus > 0
CREATE OR REPLACE FUNCTION add_love(pts int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF pts <= 0 THEN RAISE EXCEPTION 'pts harus > 0'; END IF;
  UPDATE stats SET love_points = love_points + pts, updated_at = now() WHERE id = 1;
END $$;
