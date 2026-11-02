import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nduyku — Ruang Memori Kita",
  description: "Simpan kenangan, main games berdua, denger lofi. Milik dua orang saja.",
};

const antiFlash = `(function(){try{var t=localStorage.getItem("ndy-theme");if(t)document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-theme="light" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: antiFlash }} /></head>
      <body>{children}</body>
    </html>
  );
}
