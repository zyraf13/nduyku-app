"use client";
// 4 gaya bingkai ala PRD v2.1: polaroid | filmstrip | washitape | softcurved
import type { ReactNode } from "react";

export const FRAMES = [
  { id: "polaroid", label: "📷 Polaroid" },
  { id: "filmstrip", label: "🎞️ Film" },
  { id: "washitape", label: "♡ Washi" },
  { id: "softcurved", label: "🌙 Lembut" },
] as const;
export type FrameId = (typeof FRAMES)[number]["id"];

export default function PhotoFrame({ frame, url, notes, alt, children }: {
  frame: string; url?: string; notes?: string | null; alt: string; children?: ReactNode;
}) {
  const media = url ? "// eslint-disable-next-line @next/next/no-img-element\n" : null;
  const img = url ? (
    <img src={url} alt={alt} loading="lazy" className="w-full object-cover" />
  ) : <div className="aspect-square w-full animate-pulse bg-srf-high" />;

  if (frame === "filmstrip")
    return (
      <div className="relative rounded-lg bg-neutral-900 p-1.5 shadow-lg">
        <div className="absolute inset-y-1 left-0 flex w-2 flex-col justify-around opacity-70">
          {[...Array(6)].map((_, i) => <span key={i} className="mx-auto h-2 w-2.5 rounded-[2px] bg-neutral-950 outline outline-1 outline-neutral-700" />)}
        </div>
        <div className="absolute inset-y-1 right-0 flex w-2 flex-col justify-around opacity-70">
          {[...Array(6)].map((_, i) => <span key={i} className="mx-auto h-2 w-2.5 rounded-[2px] bg-neutral-950 outline outline-1 outline-neutral-700" />)}
        </div>
        <div className="mx-3 overflow-hidden rounded-sm">{img}</div>
        <Caption notes={notes} cls="text-[13px] text-neutral-200" />
      </div>
    );

  if (frame === "washitape")
    return (
      <div className="relative">
        <span className="absolute -top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 -rotate-3 rounded-sm bg-p-fixd opacity-80 shadow-sm" />
        <div className="overflow-hidden rounded-xl bg-white p-3 shadow-md transition group-hover:rotate-1 group-hover:scale-[1.02]">
          {img}
          <Caption notes={notes} cls="text-[13px] text-outline" />
        </div>
      </div>
    );

  if (frame === "softcurved")
    return (
      <div className="overflow-hidden rounded-3xl bg-srf-lowest shadow-xl ring-1 ring-outline-var">
        {img}
        <Caption notes={notes} cls="text-[13px] text-on-sv" />
      </div>
    );

  // default: polaroid
  return (
    <div className="bg-white pb-12 pl-3 pr-3 pt-3 shadow-lg transition group-hover:-rotate-1 group-hover:scale-[1.02]">
      <div className="overflow-hidden">{img}</div>
      <p className="inset-x-3 bottom-4 absolute text-center text-[13px] text-neutral-600" style={{ fontFamily: "cursive" }}>
        {notes || "♥"}
      </p>
    </div>
  );
}

function Caption({ notes, cls }: { notes?: string | null; cls: string }) {
  return notes ? <p className={"px-2 py-1.5 " + cls}>{notes}</p> : null;
}
