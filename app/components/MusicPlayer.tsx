"use client";
// Slot audio milik sendiri: taruh MP3 di public/audio/sampai-jadi-debu.mp3
// (hak cipta: pastikan file legal — unduhan resmi/rilisan favoritmu sendiri)
import { useEffect, useRef, useState } from "react";

const TRACK = { title: "Sampai Jadi Debu — Banda Neira", src: "/audio/sampai-jadi-debu.mp3" };

export default function MusicPlayer() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!audio.current) return;
    audio.current.volume = 0.35;
  }, []);

  function toggle() {
    const a = audio.current!;
    if (on) { a.pause(); setOn(false); return; }
    a.play().then(() => setOn(true)).catch(() => { setMissing(true); setOn(false); });
  }

  return (
    <div className="fixed bottom-20 left-3 z-40 flex max-w-[13rem] items-center gap-2 rounded-full bg-srf px-3 py-2 shadow md:bottom-4">
      <audio ref={audio} loop src={TRACK.src} onError={() => missing || setMissing(true)} />
      <button onClick={toggle} aria-label={on ? "Matikan musik" : "Putar musik"}
        className="h-8 w-8 shrink-0 rounded-full bg-p-cont text-on-p-cont">
        {on ? "⏸" : "▶"}
      </button>
      <div className="min-w-0">
        <p className={"truncate text-xs font-semibold text-on-s " + (on ? "animate-pulse" : "")}>
          {missing ? "🎵 (taruh MP3 di /public/audio)" : `🎵 ${TRACK.title}`}
        </p>
      </div>
    </div>
  );
}
