"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import PhotoFrame, { FRAMES, type FrameId } from "@/app/components/PhotoFrame";
import { compressImage } from "@/lib/imageCompressor";

type Memory = { id: string; name: string; mime: string; path: string; notes: string | null; frame_style: string; user_email: string; created_at: string };

export default function GalleryPage() {
  const [items, setItems] = useState<Memory[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [me, setMe] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [frame, setFrame] = useState<FrameId>("polaroid");
  const [preview, setPreview] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sb = supabase();
    const { data } = await sb.from("memories").select("*").order("created_at", { ascending: false });
    if (!data) return;
    setItems(data as Memory[]);
    const next: Record<string, string> = {};
    await Promise.all(data.map(async (m) => {
      const { data: s } = await sb.storage.from("memories").createSignedUrl(m.path, 3600);
      if (s) next[m.id] = s.signedUrl;
    }));
    setUrls(next);
  }, []);

  useEffect(() => { load(); supabase().auth.getUser().then(({ data }) => setMe(data.user?.email ?? "")); }, [load]);

  async function submit() {
    if (!file) { setErr("Pilih fotonya dulu ya 🥺"); return; }
    setErr(""); setBusy(true);
    const sb = supabase();
    const { data: { user } } = await sb.auth.getUser();
    try {
      const small = await compressImage(file);
      const path = `${user?.id}/${Date.now()}-${small.name}`;
      const { error: upErr } = await sb.storage.from("memories").upload(path, small);
      if (upErr) throw new Error("Upload gagal: " + upErr.message);
      const { error: dbErr } = await sb.from("memories").insert({
        user_email: user!.email, name: file.name,
        mime: small.type || "application/octet-stream", path,
        notes: notes.trim(), frame_style: frame,
      });
      if (dbErr) throw new Error("Simpan gagal: " + dbErr.message);
      setFile(null); setNotes(""); setPreview(""); setFrame("polaroid");
      await load();
    } catch (e) { setErr(String((e as Error).message)); }
    setBusy(false);
  }

  async function remove(m: Memory) {
    if (!confirm(`Hapus "${m.name}"? Ga balik lagi lho.`)) return;
    const sb = supabase();
    await sb.storage.from("memories").remove([m.path]);
    await sb.from("memories").delete().eq("id", m.id);
    setOpenId(null);
    load();
  }

  const open = items.find((m) => m.id === openId);

  return (
    <main className="mx-auto min-h-screen max-w-3xl p-4 pb-40 sm:p-6 sm:pb-16">
      <header className="mb-4">
        <h1 className="font-display text-2xl font-bold text-primary">📸 Galeri Kenangan</h1>
        <p className="text-xs text-on-sv">Foto berbingkai + catatan manis kalian</p>
      </header>

      <section className="mb-6 rounded-3xl bg-srf p-4 shadow">
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-full bg-p-cont px-4 py-2 text-xs font-bold text-on-p-cont">
            {file ? "↻ Ganti foto" : "☁️ Pilih foto"}
            <input type="file" accept="image/*,video/*" className="hidden" disabled={busy}
              onChange={(e) => { const f = e.target.files?.[0] ?? null; setFile(f); setPreview(f && f.type.startsWith("image/") ? URL.createObjectURL(f) : ""); e.target.value = ""; }} />
          </label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={200}
            placeholder="Catatan manis… (mis. 'pertama ke bali 💗')"
            className="min-w-48 flex-1 rounded-full bg-srf-lowest px-4 py-2 text-sm text-on-s outline-none ring-1 ring-outline-var focus:ring-primary" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FRAMES.map((f) => (
            <button key={f.id} onClick={() => setFrame(f.id)}
              className={"rounded-full px-3 py-1.5 text-xs font-semibold transition " + (frame === f.id ? "bg-primary text-on-primary" : "bg-srf-lowest text-on-sv")}>
              {f.label}
            </button>
          ))}
        </div>
        {preview && <div className="mt-3 w-40"><PhotoFrame frame={frame} url={preview} notes={notes} alt="preview" /></div>}
        {err && <p className="mt-2 text-xs font-semibold text-err">{err}</p>}
        <button onClick={submit} disabled={busy}
          className="mt-3 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary shadow disabled:opacity-50">
          {busy ? "Mengunggah…" : "💾 Simpan Kenangan"}
        </button>
      </section>

      {items.length === 0 ? (
        <p className="rounded-2xl bg-srf p-6 text-center text-sm text-outline">Belum ada kenangan. Upload foto pertama kalian 🥺</p>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 [&>*]:mb-4">
          {items.map((m) => (
            <div key={m.id} className="group relative break-inside-avoid cursor-pointer" onClick={() => setOpenId(m.id)}>
              <PhotoFrame frame={m.frame_style || "polaroid"} url={urls[m.id]} notes={m.notes} alt={m.name} />
              {m.user_email === me && (
                <button onClick={(e) => { e.stopPropagation(); remove(m); }} aria-label="Hapus"
                  className="absolute right-2 top-2 hidden h-7 w-7 rounded-full bg-err text-on-err-c shadow group-hover:block">✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpenId(null)}>
          <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-3xl bg-srf p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {open.mime.startsWith("video") ? (
              <video src={urls[open.id]} controls className="w-full rounded-xl" />
            ) : (
              <PhotoFrame frame={open.frame_style || "polaroid"} url={urls[open.id]} notes={open.notes} alt={open.name} />
            )}
            <p className="mt-3 text-center text-xs text-on-sv">
              {new Date(open.created_at).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Makassar" })}
            </p>
            {open.user_email === me && (
              <button onClick={() => remove(open)} className="mt-3 w-full rounded-full bg-err px-4 py-2 text-sm font-bold text-on-primary">
                🗑 Hapus kenangan ini
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
