"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import TicTacToe from "@/app/components/games/TicTacToe";
import MemoryMatch from "@/app/components/games/MemoryMatch";
import ChemistryQuiz from "@/app/components/games/ChemistryQuiz";
import CatchHearts from "@/app/components/games/CatchHearts";

export default function GamesPage() {
  const [me, setMe] = useState("");
  const [stats, setStats] = useState({ p1_wins: 0, p2_wins: 0, draws: 0, love_points: 0 });
  const [tab, setTab] = useState("ttt");

  const load = async () => {
    const { data } = await supabase().from("stats").select("*").eq("id", 1).single();
    if (data) setStats(data);
  };
  useEffect(() => {
    load();
    supabase().auth.getUser().then(({ data }) => setMe(data.user?.email ?? ""));
  }, []);

  const tabs = [
    { id: "ttt", label: "🐱 Tic-Tac-Toe" },
    { id: "mem", label: "🃏 Memory" },
    { id: "quiz", label: "💘 Kuis" },
    { id: "catch", label: "❤️ Tangkap Hati" },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-3xl p-4 pb-40 sm:p-6 sm:pb-16">
      <h1 className="font-display text-2xl font-bold text-primary">🎮 Games Berdua</h1>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([["Player 1 (Dia)", stats.p1_wins, "bg-p-fix"], ["Player 2 (Kamu)", stats.p2_wins, "bg-s-fix"],
           ["Seri / Peluk Damai", stats.draws, "bg-butter"], ["Kasih Sayang", stats.love_points, "bg-mint"]] as const).map(([label, val, bg]) => (
          <div key={label} className={bg + " rounded-2xl p-3 shadow"}>
            <p className="text-[11px] font-semibold text-on-sv">{label}</p>
            <p className="font-display text-2xl font-bold text-on-s">{val}</p>
          </div>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-1 rounded-full bg-srf p-1 shadow">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={"rounded-full px-3 py-1.5 text-xs font-semibold transition " + (tab === t.id ? "bg-p-cont text-on-p-cont" : "text-on-sv")}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-srf p-4 shadow">
        {tab === "ttt" && <TicTacToe onDone={load} />}
        {tab === "mem" && <MemoryMatch onDone={load} />}
        {tab === "quiz" && <ChemistryQuiz me={me} onDone={load} />}
        {tab === "catch" && <CatchHearts onDone={load} />}
      </div>
    </main>
  );
}
