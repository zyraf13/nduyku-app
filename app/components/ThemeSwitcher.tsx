"use client";
import { useEffect, useState } from "react";

const LABELS: Record<string, string> = { light: "🌸", dark: "🌙", rain: "🌧️", calm: "🍃" };

export default function ThemeSwitcher() {
  const [cur, setCur] = useState("light");
  useEffect(() => {
    setCur(document.documentElement.dataset.theme || "light");
  }, []);
  const set = (t: string) => {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("ndy-theme", t); } catch {}
    setCur(t);
  };
  return (
    <div className="fixed bottom-[4.6rem] right-3 z-40 flex flex-col gap-2 sm:bottom-4 sm:top-auto">
      {Object.entries(LABELS).map(([k, e]) => (
        <button key={k} onClick={() => set(k)}
          className={"h-10 w-10 rounded-full text-xl shadow transition " + (cur === k ? "bg-p-cont scale-110" : "bg-srf")}
          aria-label={"Tema " + k} title={"Tema " + k}>{e}</button>
      ))}
    </div>
  );
}
