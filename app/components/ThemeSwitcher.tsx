"use client";
import { useEffect, useState } from "react";

const LABELS: [string, string][] = [["light", "🌸"], ["dark", "🌙"], ["rain", "🌧️"], ["calm", "🍃"]];

export default function ThemeSwitcher() {
  const [cur, setCur] = useState("light");
  useEffect(() => { setCur(document.documentElement.dataset.theme || "light"); }, []);
  const set = (t: string) => {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("ndy-theme", t); } catch {}
    setCur(t);
  };
  return (
    <div className="fixed bottom-4 right-3 z-40 hidden flex-col gap-2 md:flex">
      {LABELS.map(([k, e]) => (
        <button key={k} onClick={() => set(k)}
          className={"h-10 w-10 rounded-full text-xl shadow transition " + (cur === k ? "scale-110 bg-p-cont" : "bg-srf")}
          aria-label={"Tema " + k} title={"Tema " + k}>{e}</button>
      ))}
    </div>
  );
}
