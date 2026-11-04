"use client";
import { Lottie } from "lottie-react";
import cat from "./dance-cat.json";

export default function Mascot() {
  return (
    <div className="flex flex-col items-center">
      {/* ponytail: lottie 130KB dimuat di client saja; kalau berat, ganti PNG + CSS animasi */}
      <Lottie src={cat} loop autoplay className="h-40 w-40 sm:h-56 sm:w-56" aria-label="Maskot kucing si Manja" />
      <p className="mt-1 text-xs font-semibold text-outline">Maskot: si Manja</p>
    </div>
  );
}
