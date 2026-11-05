"use client";
import { useState } from "react";
import { record, type Winner } from "./shared";

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const X = "🐱", O = "🐟";

export default function TicTacToe({ onDone }: { onDone: () => void }) {
  const [board, setBoard] = useState<(null | string)[]>(Array(9).fill(null));
  const [p1Turn, setP1Turn] = useState(true);
  const [done, setDone] = useState<Winner | null>(null);

  function click(i: number) {
    if (board[i] || done) return;
    const next = [...board];
    next[i] = p1Turn ? X : O;
    setBoard(next);
    for (const [a, b, c] of LINES) {
      if (next[a] && next[a] === next[b] && next[a] === next[c]) {
        const w: Winner = next[a] === X ? "p1" : "p2";
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
        {done ? (done === "draw" ? "Seri! Peluk damai 🤗" : done === "p1" ? "Dia menang! 🎉" : "Kamu menang! 🎉") : `Giliran: ${p1Turn ? "Dia 🐱" : "Kamu 🐟"}`}
      </p>
      <div className="mx-auto grid w-64 grid-cols-3 gap-2">
        {board.map((v, i) => (
          <button key={i} onClick={() => click(i)}
            className="flex aspect-square items-center justify-center rounded-2xl bg-srf-lowest font-display text-3xl font-bold text-primary transition hover:bg-p-fix">
            {v ?? ""}
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
