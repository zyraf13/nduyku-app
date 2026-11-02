"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function Login() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const sb = supabase();
    const { error } = mode === "in"
      ? await sb.auth.signInWithPassword({ email, password: pass })
      : await sb.auth.signUp({ email, password: pass });
    if (error) { setMsg(error.message); return; }
    if (mode === "up") { setMsg("Akun dibuat! Kalau Supabase minta konfirmasi email, cek inbox dulu ya."); return; }
    r.push("/");
    r.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-srf p-8 shadow-lg">
        <h1 className="mb-1 text-center font-display text-3xl font-bold text-primary">Nduyku 💖</h1>
        <p className="mb-6 text-center text-sm text-on-sv">Ruang memori kita. Cuma buat kita berdua.</p>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="email" className="mb-3 w-full rounded-xl bg-srf-lowest px-4 py-3 text-on-s outline outline-1 outline-outline-var focus:outline-primary" />
        <input type="password" required minLength={6} value={pass} onChange={(e) => setPass(e.target.value)}
          placeholder="password (min. 6)" className="mb-4 w-full rounded-xl bg-srf-lowest px-4 py-3 text-on-s outline outline-1 outline-outline-var focus:outline-primary" />
        <button className="w-full rounded-xl bg-primary py-3 font-semibold text-on-primary transition hover:opacity-90">
          {mode === "in" ? "Masuk" : "Daftar"}
        </button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="mt-4 w-full text-center text-xs text-outline hover:text-primary">
          {mode === "in" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
        </button>
        {msg && <p className="mt-4 text-center text-sm text-err">{msg}</p>}
      </form>
    </main>
  );
}
