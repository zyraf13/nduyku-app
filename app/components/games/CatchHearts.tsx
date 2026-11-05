"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type Drop = { id: number; x: number; heart: boolean; dur: number; delay: number; caught: boolean };

const DURATION = 30; // detik

export default function CatchHearts({ onDone, onLove }: { onDone: () => void; onLove?: (pts: number) => void }) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [sent, setSent] = useState(false);
  const nid = useRef(1);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const spawn = setInterval(() => {
      const d: Drop = {
        id: nid.current++,
        x: Math.random() * 86 + 4,
        heart: Math.random() < 0.75,
        dur: 3.2 + Math.random() * 2,
        delay: 0,
        caught: false,
      };
      setDrops((ds) => [...ds.slice(-24), d]);
    }, 550);
    const tick = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => { clearInterval(spawn); clearInterval(tick); };
  }, [running]);

  useEffect(() => {
    if (running && left <= 0) {
      setRunning(false);
      const pts = Math.min(30, scoreRef.current);
      if (pts > 0 && !sent) {
        setSent(true);
        supabase().rpc("add_love", { pts }).then(() => { onDone(); onLove?.(pts); });
      } else onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, running]);

  function start() { setDrops([]); setScore(0); scoreRef.current = 0; setLeft(DURATION); setSent(false); setRunning(true); }

  function tap(d: Drop) {
    if (d.caught || !running) return;
    d.caught = true;
    setDrops((ds) => ds.filter((x) => x.id !== d.id));
    if (d.heart) { scoreRef.current += 1; setScore(scoreRef.current); }
    else { scoreRef.current = Math.min(30, Math.max(0, scoreRef.current - 1)); setScore(scoreRef.current); } // ule si Manja = kurangi 1
  }

  return (
    <div>
      <p className="mb-2 text-center text-sm text-on-sv">
        {running ? `⏱ ${Math.max(0,left)}s · ❤️ ${score}` : `Tangkap ❤️ (hindari 😺) — 30 detik! Bonus jadi Kasih Sayang`}
      </p>
      <div className="relative mx-auto h-80 w-full max-w-sm select-none overflow-hidden rounded-3xl bg-srf-lowest ring-1 ring-outline-var">
        {drops.map((d) => (
          <button key={d.id} onClick={() => tap(d)} aria-label={d.heart ? "hati" : "maskot"}
            className="absolute top-0 cursor-pointer text-3xl will-change-transform"
            style={{ left: `${d.x}%`, animation: `ndy-fall ${d.dur}s linear forwards` }}>
            {d.heart ? "❤️" : "😺"}
          </button>
        ))}
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-srf-low/60">
            {left <= 0 && <p className="font-display text-lg font-bold text-primary">+{Math.min(30, score)} Kasih Sayang 💕</p>}
            <button onClick={start} className="rounded-full bg-p-cont px-6 py-3 text-sm font-bold text-on-p-cont shadow">
              {left <= 0 ? "Main lagi" : "▶ Mulai"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
