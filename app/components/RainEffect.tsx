"use client";
// ponytail: hujan CSS murni — butir span animasi linear infinite, murah di HP;
// kalau butuh 3D/parallax nanti ganti canvas 2D
import { useEffect, useState } from "react";

export default function RainEffect() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const apply = () => setOn(document.documentElement.dataset.theme === "rain");
    apply();
    const obs = new MutationObserver(apply);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  if (!on) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <span key={i}
          className="absolute top-[-10%] h-24 w-[2px] rounded-full opacity-30 will-change-transform"
          style={{
            background: "rgb(var(--c-on-sv))",
            left: `${(i * 2.5 + (i % 3)) % 100}%`,
            animation: "ndy-rain 0.9s linear infinite",
            animationDelay: `${-(i % 12) * 0.37}s`,
          }} />
      ))}
      <style>{`@keyframes ndy-rain { from { transform: translateY(0); opacity: 1; } to { transform: translateY(115vh); opacity: 0.55; } }`}</style>
    </div>
  );
}
