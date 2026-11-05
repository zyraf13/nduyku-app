import type { Metadata, Viewport } from "next";
import { Baloo_2 } from "next/font/google";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import RainEffect from "./components/RainEffect";
import MusicPlayer from "./components/MusicPlayer";
import ThemeSwitcher from "./components/ThemeSwitcher";

const baloo = Baloo_2({ subsets: ["latin"], variable: "--font-baloo" });

export const metadata: Metadata = {
  title: "Nduyku — Ruang Memori Kita",
  description: "Simpan kenangan, main games berdua, denger musik. Milik dua orang saja.",
  manifest: "/manifest.json",
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
};

export const viewport: Viewport = { themeColor: "#f4a2c2" };

const antiFlash = `(function(){try{var t=localStorage.getItem("ndy-theme");if(t)document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-theme="light" suppressHydrationWarning className={baloo.variable}>
      <head><script dangerouslySetInnerHTML={{ __html: antiFlash }} /></head>
      <body>
        <RainEffect />
        {children}
        <MusicPlayer />
        <ThemeSwitcher />
        <BottomNav />
      </body>
    </html>
  );
}
