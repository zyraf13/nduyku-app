"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type Quiz = { id: string; creator_email: string; question: string; options: string[]; is_answered: boolean; created_at: string };

export default function ChemistryQuiz({ me, onDone }: { me: string; onDone: () => void }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [msg, setMsg] = useState("");
  const [guess, setGuess] = useState<number | null>(null);
  // form buat kuis
  const [q, setQ] = useState("");
  const [opts, setOpts] = useState(["", "", ""]);
  const [correct, setCorrect] = useState(0);

  const load = useCallback(async () => {
    // correct_index TIDAK di-select — jawaban dicek server (RPC answer_quiz)
    const { data } = await supabase()
      .from("couple_quizzes").select("id,creator_email,question,options,is_answered,created_at")
      .order("created_at", { ascending: false}).limit(20);
    setQuizzes((data ?? []) as Quiz[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createQuiz() {
    if (!q.trim() || opts.some((o) => !o.trim())) { setMsg("Lengkapi dulu: pertanyaan + 3 pilihan."); return; }
    const { error } = await supabase().from("couple_quizzes").insert({
      creator_email: me, question: q.trim(), options: opts.map((o) => o.trim()), correct_index: correct,
    });
    setMsg(error ? "Gagal: " + error.message : "Kuis terkirim! Sekarang gantian dia yang nebak 😉");
    if (!error) { setQ(""); setOpts(["", "", ""]); setCorrect(0); load(); }
  }

  async function pick(quiz: Quiz, i: number) {
    setGuess(i);
    setMsg("");
    const { data, error } = await supabase().rpc("answer_quiz", { qid: quiz.id, guess: i });
    if (error) { setMsg("Gagal: " + error.message); }
    else if (data === true) { setMsg("BENAR! 💘 +5 Kasih Sayang"); onDone(); load(); }
    else setMsg("Belum tepat… coba lagi 🙈");
    setGuess(null);
  }

  const toGuess = quizzes.find((z) => !z.is_answered && z.creator_email !== me);

  return (
    <div>
      {toGuess ? (
        <div className="mb-4 rounded-2xl bg-p-fix p-4">
          <p className="mb-1 text-xs font-semibold text-on-p-cont">Kuis dari {toGuess.creator_email}</p>
          <p className="mb-3 font-display text-lg font-bold text-on-s">{toGuess.question}</p>
          <div className="flex flex-col gap-2">
            {(toGuess.options as string[]).map((o, i) => (
              <button key={i} onClick={() => pick(toGuess, i)} disabled={guess !== null}
                className="rounded-full bg-srf-lowest px-4 py-2 text-sm font-semibold text-on-s transition hover:bg-p-fix disabled:opacity-50">
                {o}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-2xl bg-srf p-4">
          <p className="mb-2 text-sm font-semibold text-on-s">✍️ Buat kuis buat dia</p>
          <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={140}
            placeholder="Pertanyaan… (mis. 'Tempat kencan favorit kita?')"
            className="mb-2 w-full rounded-xl bg-srf-lowest px-3 py-2 text-sm text-on-s outline-none ring-1 ring-outline-var focus:ring-primary" />
          {opts.map((o, i) => (
            <div key={i} className="mb-2 flex items-center gap-2">
              <input type="radio" name="correct" checked={correct === i} onChange={() => setCorrect(i)} aria-label={`jawaban benar ${i+1}`} />
              <input value={o} onChange={(e) => setOpts(opts.map((x, j) => (j === i ? e.target.value : x)))} maxLength={60}
                placeholder={`Pilihan ${i + 1}${i === correct ? " (jawaban benar ✓)" : ""}`}
                className="w-full rounded-xl bg-srf-lowest px-3 py-2 text-sm text-on-s outline-none ring-1 ring-outline-var focus:ring-primary" />
            </div>
          ))}
          <button onClick={createQuiz} className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-on-primary">Kirim Kuis 💘</button>
        </div>
      )}
      {msg && <p className="mb-3 text-center text-sm font-semibold text-primary">{msg}</p>}
      {quizzes.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold text-on-sv">Riwayat kuis</p>
          <ul className="space-y-1 text-xs text-on-sv">
            {quizzes.slice(0, 8).map((z) => (
              <li key={z.id} className="truncate">• {z.question} — {z.is_answered ? "terjawab ✅" : "menunggu ⏳"}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
