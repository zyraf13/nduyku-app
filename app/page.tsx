"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import ThemeSwitcher from "./components/ThemeSwitcher";
import MusicPlayer from "./components/MusicPlayer";
import Gallery from "./components/Gallery";
import Games from "./components/Games";

export type Stats = { p1_wins: number; p2_wins: number; draws: number; love_points: number };

export default function Home() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);

  const loadStats = async () => {
    const sb = supabase();
    const { data } = await sb.from("stats").select("*").eq("id", 1).single();
    if (data) setStats(data);
  };

  useEffect(() => {
    supabase().auth.getUser().then(({ data }) => {
      if (data.user) setEmail(data.user.email ?? "");
      else r.push("/login");
    });
    loadStats();
  }, [r]);

  async function logout() {
    await supabase().auth.signOut();
    r.push("/login");
    r.refresh();
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl p-4 pb-40 sm:p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary sm:text-4xl">Nduyku 💖</h1>
          <p className="text-xs text-on-sv">Halo, {email}</p>
        </div>
        <button onClick={logout} className="rounded-full bg-srf px-4 py-2 text-xs font-semibold text-on-sv transition hover:bg-err-c hover:text-on-err-c">
          Keluar
        </button>
      </header>

      {/* stats */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([["Player 1 (Dia)", stats?.p1_wins, "bg-p-fix"], ["Player 2 (Kamu)", stats?.p2_wins, "bg-s-fix"],
           ["Seri / Peluk Damai", stats?.draws, "bg-butter"], ["Kasih Sayang", stats?.love_points, "bg-mint"]] as const).map(([label, val, bg]) => (
          <div key={label} className={bg + " rounded-2xl p-4 shadow"}>
            <p className="text-[11px] font-semibold text-on-sv">{label}</p>
            <p className="font-display text-2xl font-bold text-on-s">{val ?? "—"}</p>
          </div>
        ))}
      </section>

      <Gallery />
      <Games onDone={loadStats} />

      <ThemeSwitcher />
      <MusicPlayer />
    </main>
  );
}
