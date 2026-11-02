"use client";
import { useEffect, useRef, useState } from "react";

const TRACKS = [
  { title: "Lofi Love Beats — Neko Cozy Nap", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Pastel Dream — Sunset Together", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Purr Machine — Boba Time", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

export default function MusicPlayer() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [idx, setIdx] = useState(0);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!audio.current) return;
    audio.current.src = TRACKS[idx].src;
    if (on) audio.current.play().catch(() => setOn(false));
  }, [idx, on]);

  return (
    <div className="fixed bottom-4 left-3 z-40 flex max-w-[13rem] items-center gap-2 rounded-full bg-srf px-3 py-2 shadow">
      <audio ref={audio} loop onEnded={() => setIdx((i) => (i + 1) % TRACKS.length)} />
      <button onClick={() => setOn(!on)} className="h-8 w-8 shrink-0 rounded-full bg-p-cont text-on-p-cont" aria-label={on ? "Pause" : "Play"}>
        {on ? "⏸" : "▶"}
      </button>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-on-s">{TRACKS[idx].title}</p>
        <button onClick={() => setIdx((i) => (i + 1) % TRACKS.length)} className="text-[10px] text-outline hover:text-primary">next ›</button>
      </div>
    </div>
  );
}
