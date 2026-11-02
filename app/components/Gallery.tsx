"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type Memory = { id: string; name: string; mime: string; path: string };

export default function Gallery() {
  const [items, setItems] = useState<Memory[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const sb = supabase();
    const { data } = await sb.from("memories").select("*").order("created_at", { ascending: false });
    if (!data) return;
    setItems(data);
    // signed URL per item (bucket private, 1 jam)
    const next: Record<string, string> = {};
    await Promise.all(data.map(async (m) => {
      const { data: s } = await sb.storage.from("memories").createSignedUrl(m.path, 3600);
      if (s) next[m.id] = s.signedUrl;
    }));
    setUrls(next);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const sb = supabase();
    const { data: { user } } = await sb.auth.getUser();
    for (const f of files) {
      const path = `${user?.id}/${Date.now()}-${f.name}`;
      const { error: upErr } = await sb.storage.from("memories").upload(path, f);
      if (upErr) { alert("Upload gagal: " + upErr.message); continue; }
      await sb.from("memories").insert({ user_email: user!.email, name: f.name, mime: f.type || "application/octet-stream", path });
    }
    setBusy(false);
    load();
  }

  async function remove(m: Memory) {
    if (!confirm(`Hapus "${m.name}"? Ga balik lagi lho.`)) return;
    const sb = supabase();
    await sb.storage.from("memories").remove([m.path]);
    await sb.from("memories").delete().eq("id", m.id);
    load();
  }

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-on-s">📸 Galeri Kenangan</h2>
        <label className="cursor-pointer rounded-full bg-primary px-4 py-2 text-xs font-bold text-on-primary shadow transition hover:opacity-90">
          {busy ? "Mengunggah…" : "☁️ Upload"}
          <input type="file" multiple accept="image/*,video/*" className="hidden" disabled={busy}
            onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
        </label>
      </div>
      {items.length === 0 ? (
        <p className="rounded-2xl bg-srf p-6 text-center text-sm text-outline">Belum ada kenangan. Yuk upload foto pertama kalian 🥺</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((m) => (
            <div key={m.id} className="group relative overflow-hidden rounded-2xl bg-srf shadow">
              {m.mime.startsWith("video") ? (
                <video src={urls[m.id]} controls className="aspect-square w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urls[m.id]} alt={m.name} className="aspect-square w-full object-cover" />
              )}
              <button onClick={() => remove(m)} aria-label="Hapus"
                className="absolute right-2 top-2 hidden h-7 w-7 rounded-full bg-err text-on-err-c shadow group-hover:block">✕</button>
              <p className="truncate px-2 py-1 text-[10px] text-on-sv">{m.name}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
