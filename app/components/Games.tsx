"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type Winner = "p1" | "p2" | "draw";

async function record(game: string, winner: Winner) {
  const sb = supabase();
  await sb.from("game_results").insert({ game, winner });
  await sb.rpc("bump_stat", { winner });
}

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function TicTacToe({ onDone }: { onDone: () => void }) {
  const [board, setBoard] = useState<(null | "X" | "O")[]>(Array(9).fill(null));
  const [p1Turn, setP1Turn] = useState(true);
  const [done, setDone] = useState<Winner | null>(null);

  function click(i: number) {
    if (board[i] || done) return;
    const next = [...board];
    next[i] = p1Turn ? "X" : "O";
    setBoard(next);
    for (const [a, b, c] of LINES) {
      if (next[a] && next[a] === next[b] && next[a] === next[c]) {
        const w: Winner = next[a] === "X" ? "p1" : "p2";
        setDone(w); record("tictactoe", w).then(onDone);
        return;
      }
    }
    if (next.every(Boolean)) { setDone("draw"); record("tictactoe", "draw").then(onDone); return; }
    setP1Turn(!p1Turn);
  }

  return (
    <div>
      <p className="mb-2 text-center text-sm text-on-sv">
        {done ? (done === "draw" ? "Seri! Peluk damai 🤗" : done === "p1" ? "Dia menang! 🎉" : "Kamu menang! 🎉") : `Giliran: ${p1Turn ? "Dia (X)" : "Kamu (O)"}`}
      </p>
      <div className="mx-auto grid w-64 grid-cols-3 gap-2">
        {board.map((v, i) => (
          <button key={i} onClick={() => click(i)}
            className="flex aspect-square items-center justify-center rounded-2xl bg-srf-lowest font-display text-3xl font-bold text-primary transition hover:bg-p-fix">
            {v}
          </button>
        ))}
      </div>
      {done && (
        <button onClick={() => { setBoard(Array(9).fill(null)); setDone(null); setP1Turn(true); }}
          className="mx-auto mt-3 block rounded-full bg-p-cont px-5 py-2 text-xs font-bold text-on-p-cont">Main lagi</button>
      )}
    </div>
  );
}

const EMOJI = ["😺", "💖", "🧋", "🌸", "🌙", "🥬"];

function MemoryMatch({ onDone }: { onDone: () => void }) {
  const start = useMemo(() => [...EMOJI, ...EMOJI]
    .map((e) => ({ e, k: Math.random() }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.e), []);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [counts, setCounts] = useState({ p1: 0, p2: 0 });
  const p1Turn = open.length % 2 === 0;
  const finished = matched.length === start.length;

  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open;
    const t = setTimeout(() => {
      if (start[a] === start[b]) {
        setMatched((m) => [...m, a, b]);
        setCounts((c) => (p1Turn ? { ...c, p1: c.p1 + 1 } : { ...c, p2: c.p2 + 1 }));
      }
      setOpen([]);
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!finished) return;
    const w: Winner = counts.p1 === counts.p2 ? "draw" : counts.p1 > counts.p2 ? "p1" : "p2";
    record("memory", w).then(onDone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  function flip(i: number) {
    if (open.length >= 2 || open.includes(i) || matched.includes(i)) return;
    setOpen([...open, i]);
  }

  return (
    <div>
      <p className="mb-2 text-center text-sm text-on-sv">Giliran: {p1Turn ? "Dia" : "Kamu"} · pasangan Dia {counts.p1} vs Kamu {counts.p2}</p>
      <div className="mx-auto grid w-72 grid-cols-4 gap-2">
        {start.map((e, i) => {
          const face = open.includes(i) || matched.includes(i);
          return (
            <button key={i} onClick={() => flip(i)}
              className={"flex aspect-square items-center justify-center rounded-2xl text-2xl transition " +
                (face ? "bg-mint" : "bg-srf-lowest hover:bg-p-fix")}>
              {face ? e : "🐾"}
            </button>
          );
        })}
      </div>
      {finished && (
        <p className="mt-3 text-center text-sm font-semibold text-primary">
          {counts.p1 === counts.p2 ? "Seri! Peluk damai 🤗" : counts.p1 > counts.p2 ? "Dia menang! 🎉" : "Kamu menang! 🎉"}
        </p>
      )}
    </div>
  );
}

export default function Games({ onDone }: { onDone: () => void }) {
  const [tab, setTab] = useState<"ttt" | "mem">("ttt");
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-display text-xl font-bold text-on-s">🎮 Games Berdua</h2>
        <div className="ml-auto flex gap-1 rounded-full bg-srf p-1">
          <button onClick={() => setTab("ttt")} className={"rounded-full px-3 py-1 text-xs font-semibold " + (tab === "ttt" ? "bg-p-cont text-on-p-cont" : "text-on-sv")}>Cat Tic-Tac-Toe</button>
          <button onClick={() => setTab("mem")} className={"rounded-full px-3 py-1 text-xs font-semibold " + (tab === "mem" ? "bg-p-cont text-on-p-cont" : "text-on-sv")}>Memory Match</button>
        </div>
      </div>
      <div className="rounded-2xl bg-srf p-4 shadow">{tab === "ttt" ? <TicTacToe onDone={onDone} /> : <MemoryMatch onDone={onDone} />}</div>
    </section>
  );
}
