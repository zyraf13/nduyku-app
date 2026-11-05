"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const THEMES: [string, string, string][] = [
  ["light", "🌸", "Sakura"],
  ["dark", "🌙", "Malam"],
  ["rain", "🌧️", "Hujan"],
  ["calm", "🍃", "Daun"],
];

const LINKS = [
  { href: "/", label: "Beranda", icon: "🏠" },
  { href: "/gallery", label: "Galeri", icon: "🖼️" },
  { href: "/games", label: "Games", icon: "🎮" },
];

export default function BottomNav() {
  const path = usePathname();
  const [sheet, setSheet] = useState(false);
  const [cur, setCur] = useState("light");

  useEffect(() => { setCur(document.documentElement.dataset.theme || "light"); }, []);
  function setTheme(t: string) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("ndy-theme", t); } catch {}
    setCur(t);
setSheet(false);
  }

  if (path === "/login") return null;
  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-var bg-srf-lowest/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md">
          {LINKS.map((it) => (
            <Link key={it.href} href={it.href}
              className={"flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold " + (path === it.href ? "text-primary" : "text-on-sv")}>
              <span className="text-xl leading-none">{it.icon}</span>
              {it.label}
            </Link>
          ))}
          <button onClick={() => setSheet(true)} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold text-on-sv">
            <span className="text-xl leading-none">⚙️</span>
            Tema
          </button>
        </div>
      </nav>

      {sheet && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setSheet(false)}>
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-srf p-5 pb-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="mb-3 text-center font-display text-lg font-bold text-primary">⚙️ Tema & Musik</p>
            <div className="mb-4 grid grid-cols-4 gap-2">
              {THEMES.map(([k, e, name]) => (
                <button key={k} onClick={() => setTheme(k)}
                  className={"rounded-2xl p-3 text-center transition " + (cur === k ? "bg-p-cont scale-105" : "bg-srf-lowest")}>
                  <span className="block text-2xl">{e}</span>
                  <span className="text-[10px] font-semibold text-on-sv">{name}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-outline">🎵 Musik: tekan tombol ▶ melayang di kiri bawah</p>
          </div>
        </div>
      )}
    </>
  );
}
