import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({ subsets: ["latin"], variable: "--font-baloo" });

export const metadata: Metadata = {
  title: "Nduyku — Ruang Memori Kita",
  description: "Simpan kenangan, main games berdua, denger lofi. Milik dua orang saja.",
};

const antiFlash = `(function(){try{var t=localStorage.getItem("ndy-theme");if(t)document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-theme="light" suppressHydrationWarning className={baloo.variable}>
      <head><script dangerouslySetInnerHTML={{ __html: antiFlash }} /></head>
      <body>{children}</body>
    </html>
  );
}
