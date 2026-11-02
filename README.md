# Nduyku v2 💖

Couple app full-stack: **Next.js 16 + TypeScript + Tailwind v4 + Supabase** (Postgres DB + Auth + Storage).

Ganti total dari versi HTML tunggal (`zyraf13/nduyku`) — sekarang ada database beneran, login pasangan, dan foto/video tersimpan di Supabase Storage.

## Fitur
- 🔐 Login email+password — semua email boleh daftar & lihat, asal punya akun ter-auth
- 📸 Galeri: upload foto/video → Supabase Storage (bucket private, akses via signed URL)
- 🎮 Games berdua: Cat Tic-Tac-Toe & Memory Match — hasil masuk DB (`game_results`)
- 📊 Stats pasangan: menang/seri/love points (`stats` + RPC atomik)
- 🌸 4 tema: Bunga, Senja, Hujan, Tenang (CSS variables, tersimpan di localStorage)
- 🎵 Player lofi

## Setup

1. **Bikin project** di [supabase.com](https://supabase.com) (free tier, ga perlu kartu kredit)
2. **SQL Editor** → paste seluruh isi [`supabase/schema.sql`](supabase/schema.sql) → Run
3. Ambil kredensial: **Project Settings → API** → salin `Project URL` & `anon public key`
4. **Local**: salin `.env.local.example` → `.env.local`, isi kredensial → `npm run dev`
5. **Deploy**: import repo ini ke [Vercel](https://vercel.com/new) → tambahkan 2 env var yang sama → Deploy

## Konfigurasi Supabase (sekali)
- Authentication → Providers → Email: **matikan** "Confirm email" biar langsung login

## Catatan keamanan
- Bucket `memories` **private** — cuma bisa dilihat lewat signed URL 1 jam oleh user yang lolos allowlist
- Tabel `stats` tidak bisa diupdate langsung dari client, hanya lewat RPC `bump_stat`/`add_love`
- **Catatan**: karena semua akun bisa lihat, jangan pakai password yang gampang ditebak — link app cuma dibagi ke orang yang boleh lihat
