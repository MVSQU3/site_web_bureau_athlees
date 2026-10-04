"use client";
import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { isVisible, validate, FILE_MAX, type Field } from "@/lib/forms";
import { Field as Lbl, Group, Alert } from "./ui";

type Vals = Record<string, any>;

async function prepare(file: File): Promise<File> {
  if (file.type === "application/pdf" || !file.type.startsWith("image/")) return file;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ko(new Error("Image illisible")); i.src = url; });
    const k = Math.min(1, 1400 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    const blob: Blob = await new Promise((ok) => c.toBlob((b) => ok(b!), "image/jpeg", 0.8));
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } finally { URL.revokeObjectURL(url); }
}

export default function RegistrationForm({ slug, fields, infoline }: { slug: string; fields: Field[]; infoline: string }) {
  const [vals, setVals] = useState<Vals>({});
  const [other, setOther] = useState<Record<string, string>>({});
  const [otherOn, setOtherOn] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [msg, setMsg] = useState<{ t: "err" | "ok" | ""; s: string }>({ t: "", s: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: string, v: any) => setVals((p) => ({ ...p, [k]: v }));
  const optCls = "label cursor-pointer justify-start gap-2 text-base text-base-content";
  const inCls = "input w-full text-base";

  function renderField(f: Field) {
    const k = f.key;
    switch (f.type) {
      case "section":
        return <div key={k} className="pt-4"><h3 className="text-xl font-semibold tracking-tight">{f.label}</h3>{f.help && <p className="mt-1 text-sm text-base-content/60">{f.help}</p>}</div>;
      case "textarea":
        return <Lbl key={k} label={f.label} required={f.required} help={f.help}><textarea name={k} className="textarea h-28 w-full text-base" value={vals[k] ?? ""} onChange={(e) => set(k, e.target.value)} /></Lbl>;
      case "select":
        return <Lbl key={k} label={f.label} required={f.required}><select name={k} className="select w-full text-base" value={vals[k] ?? ""} onChange={(e) => set(k, e.target.value)}><option value="">Choisir…</option>{(f.options || []).map((o) => <option key={o}>{o}</option>)}</select></Lbl>;
      case "radio":
        return (
          <Group key={k} legend={f.label} required={f.required} help={f.help}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              {(f.options || []).map((o) => <label className={optCls} key={o}><input type="radio" className="radio radio-primary radio-sm" name={k} value={o} checked={vals[k] === o} onChange={() => { setOtherOn((p) => ({ ...p, [k]: false })); set(k, o); }} /> {o}</label>)}
              {f.other && <>
                <label className={optCls}><input type="radio" className="radio radio-primary radio-sm" name={k} checked={!!otherOn[k]} onChange={() => { setOtherOn((p) => ({ ...p, [k]: true })); set(k, other[k] ? `Autre : ${other[k]}` : ""); }} /> Autre :</label>
                <input className="input input-sm min-w-40 flex-1" aria-label="Autre" disabled={!otherOn[k]} value={other[k] ?? ""} onChange={(e) => { setOther((p) => ({ ...p, [k]: e.target.value })); set(k, e.target.value.trim() ? `Autre : ${e.target.value.trim()}` : ""); }} />
              </>}
            </div>
          </Group>
        );
      case "checkbox": {
        const cur: string[] = vals[k] || [];
        const toggle = (o: string, on: boolean) => set(k, on ? [...cur, o] : cur.filter((x) => x !== o));
        const strip = cur.filter((x) => !x.startsWith("Autre : "));
        return (
          <Group key={k} legend={f.label} required={f.required} help={f.help}>
            <div className="flex flex-col items-start gap-1">
              {(f.options || []).map((o) => <label className={optCls} key={o}><input type="checkbox" className="checkbox checkbox-primary checkbox-sm" name={k} value={o} checked={cur.includes(o)} onChange={(e) => toggle(o, e.target.checked)} /> {o}</label>)}
              {f.other && <div className="flex w-full flex-wrap items-center gap-2">
                <label className={optCls}><input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={!!otherOn[k]} onChange={(e) => { setOtherOn((p) => ({ ...p, [k]: e.target.checked })); set(k, e.target.checked && other[k]?.trim() ? [...strip, `Autre : ${other[k].trim()}`] : strip); }} /> Autre :</label>
                <input className="input input-sm min-w-40 flex-1" aria-label="Autre" disabled={!otherOn[k]} value={other[k] ?? ""} onChange={(e) => { const t = e.target.value; setOther((p) => ({ ...p, [k]: t })); set(k, [...strip, ...(t.trim() ? [`Autre : ${t.trim()}`] : [])]); }} />
              </div>}
            </div>
          </Group>
        );
      }
      case "file":
        return (
          <Lbl key={k} label={f.label} required={f.required} help={f.help}>
            <input name={k} type="file" className="file-input w-full" accept="image/*,application/pdf" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) { setFiles((p) => { const n = { ...p }; delete n[k]; return n; }); return; }
              try {
                const prepared = await prepare(file);
                if (prepared.size > FILE_MAX) throw new Error("Fichier trop lourd (3 Mo maximum)");
                setFiles((p) => ({ ...p, [k]: prepared }));
                setMsg({ t: "", s: "" });
              } catch (err: any) { e.target.value = ""; setMsg({ t: "err", s: err.message }); }
            }} />
          </Lbl>
        );
      case "consent":
        return <label key={k} className={optCls + " items-start"}><input type="checkbox" className="checkbox checkbox-primary checkbox-sm mt-1" name={k} checked={!!vals[k]} onChange={(e) => set(k, e.target.checked)} /> <span className="text-sm leading-snug">{f.label}{f.required && <span className="text-error"> *</span>}</span></label>;
      default:
        return <Lbl key={k} label={f.label} required={f.required} help={f.help}><input name={k} className={inCls} type={f.type === "number" ? "number" : f.type} value={vals[k] ?? ""} onChange={(e) => set(k, e.target.value)} /></Lbl>;
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { errors } = validate(fields, vals, (k) => !!files[k]);
    if (errors.length) { setMsg({ t: "err", s: `Merci de compléter le formulaire. ${errors[0]}.` }); return; }
    setBusy(true); setMsg({ t: "", s: "" });
    try {
      const fd = new FormData();
      fd.set("data", JSON.stringify(vals));
      fd.set("website", (e.currentTarget.elements.namedItem("website") as HTMLInputElement).value);
      for (const f of fields) if (f.type === "file" && files[f.key] && isVisible(f, vals)) fd.set(`file__${f.key}`, files[f.key]);
      const r = await fetch(`/api/register/${slug}`, { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Erreur");
      setDone(true);
      setMsg({ t: "ok", s: j.message || "Merci ! Votre inscription est enregistrée." });
      document.getElementById("inscription")?.scrollIntoView({ behavior: "smooth" });
    } catch (err: any) {
      setMsg({ t: "err", s: `Échec de l'envoi : ${err.message}.${infoline ? ` Réessaie ou appelle l'Infoline : ${infoline}.` : ""}` });
    } finally { setBusy(false); }
  }

  if (done) return <div className="card bg-base-200"><div className="card-body items-center gap-3 py-12 text-center"><CheckCircle2 size={48} className="text-success" /><p className="text-xl font-medium" role="status" data-testid="success">{msg.s}</p></div></div>;
  return (
    <form className="card bg-base-200" onSubmit={submit} noValidate>
      <div className="card-body gap-4">
        {fields.filter((f) => isVisible(f, vals)).map(renderField)}
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />
        <button className="btn btn-primary btn-lg mt-2 rounded-full" disabled={busy}>{busy ? <span className="loading loading-spinner" /> : <Send size={18} />}{busy ? "Envoi…" : "Valider l'inscription"}</button>
        {msg.s && msg.t === "err" && <Alert kind="error">{msg.s}</Alert>}
      </div>
    </form>
  );
}
