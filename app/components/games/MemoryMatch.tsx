"use client";
import { useEffect, useMemo, useState } from "react";
import { record, type Winner } from "./shared";

const EMOJI = ["😺", "💖", "🧋", "🌸", "🌙", "🥬"];

export default function MemoryMatch({ onDone }: { onDone: () => void }) {
  const start = useMemo(() => [...EMOJI, ...EMOJI]
    .map((e) => ({ e, k: Math.random() })).sort((a, b) => a.k - b.k).map((x) => x.e), []);
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
