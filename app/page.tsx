"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import Mascot from "@/app/components/Mascot";

export default function Home() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState({ p1_wins: 0, p2_wins: 0, draws: 0, love_points: 0 });

  useEffect(() => {
    supabase().auth.getUser().then(({ data }) => {
      if (data.user) setEmail(data.user.email ?? "");
      else r.push("/login");
    });
    supabase().from("stats").select("*").eq("id", 1).single().then(({ data }) => { if (data) setStats(data); });
  }, [r]);

  async function logout() {
    await supabase().auth.signOut();
    r.push("/login");
    r.refresh();
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl p-4 pb-40 sm:p-6">
      <header className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold text-on-sv">Halo, {email} 👋</p>
        <button onClick={logout} className="rounded-full bg-srf px-4 py-2 text-xs font-semibold text-on-sv transition hover:bg-err-c">Keluar</button>
      </header>

      {/* hero ala v1 */}
      <section className="mb-6 flex flex-col items-center gap-4 rounded-3xl bg-srf p-6 shadow sm:flex-row sm:justify-between sm:p-8">
        <div className="text-center sm:text-left">
          <h1 className="font-display text-3xl font-bold text-primary sm:text-5xl">Selamat di Nduyku 💕</h1>
          <p className="mt-2 text-sm text-on-sv sm:text-base">Galeri, Games & Musik — cuma buat kita berdua</p>
          <div className="mt-5 flex justify-center gap-3 sm:justify-start">
            <a href="/gallery" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow transition hover:opacity-90">🖼️ Buka Galeri</a>
            <a href="/games" className="rounded-full bg-p-cont px-6 py-3 text-sm font-bold text-on-p-cont shadow transition hover:opacity-90">🎮 Main Games</a>
          </div>
        </div>
        <Mascot />
      </section>

      {/* skor kebersamaan */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([["Player 1 (Dia)", stats.p1_wins, "bg-p-fix"], ["Player 2 (Kamu)", stats.p2_wins, "bg-s-fix"],
           ["Seri / Peluk Damai", stats.draws, "bg-butter"], ["Kasih Sayang", stats.love_points, "bg-mint"]] as const).map(([label, val, bg]) => (
          <div key={label} className={bg + " rounded-2xl p-4 shadow"}>
            <p className="text-[11px] font-semibold text-on-sv">{label}</p>
            <p className="font-display text-2xl font-bold text-on-s">{val}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
