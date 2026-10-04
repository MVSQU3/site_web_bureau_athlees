"use client";
import { useState } from "react";

async function shrink(file: File): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ko(new Error("Image illisible")); i.src = url; });
    const k = Math.min(1, 1600 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    const blob: Blob = await new Promise((ok) => c.toBlob((b) => ok(b!), "image/jpeg", 0.85));
    return new File([blob], "image.jpg", { type: "image/jpeg" });
  } finally { URL.revokeObjectURL(url); }
}

export default function ImageField({ name, label, value }: { name: string; label: string; value?: string | null }) {
  const [url, setUrl] = useState(value || "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="afield">
      <span>{label}</span>
      {url && <img src={url} alt="" style={{ maxWidth: 220, borderRadius: 12, border: "1px solid var(--line)" }} />}
      <input type="hidden" name={name} value={url} />
      <input type="file" accept="image/*" disabled={busy} onChange={async (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        setBusy(true); setErr("");
        try {
          const fd = new FormData(); fd.set("file", await shrink(f));
          const r = await fetch("/api/upload", { method: "POST", body: fd });
          const j = await r.json(); if (!r.ok) throw new Error(j.error);
          setUrl(j.url);
        } catch (x: any) { setErr(x.message || "Échec du téléversement"); }
        setBusy(false);
      }} />
      <div className="arow" style={{ justifyContent: "flex-start", gap: 8 }}>
        {busy && <span className="meta">Téléversement…</span>}
        {url && <button type="button" className="abtn ghost sm" onClick={() => setUrl("")}>Retirer l&apos;image</button>}
      </div>
      {err && <span className="msg err">{err}</span>}
    </div>
  );
}
