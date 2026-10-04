"use client";
import { useState } from "react";
import { isVisible, validate, FILE_MAX, type Field } from "@/lib/forms";

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
  const label = (f: Field) => <>{f.label}{f.required && f.type !== "consent" && <span className="req"> *</span>}</>;

  function renderField(f: Field) {
    const k = f.key;
    switch (f.type) {
      case "section":
        return <div key={k}><h3 className="sub">{f.label}</h3>{f.help && <p className="help">{f.help}</p>}</div>;
      case "textarea":
        return <label key={k}>{label(f)}<textarea name={k} rows={4} value={vals[k] ?? ""} onChange={(e) => set(k, e.target.value)} />{f.help && <small>{f.help}</small>}</label>;
      case "select":
        return <label key={k}>{label(f)}<select name={k} value={vals[k] ?? ""} onChange={(e) => set(k, e.target.value)}><option value="">Choisir…</option>{(f.options || []).map((o) => <option key={o}>{o}</option>)}</select></label>;
      case "radio":
        return (
          <fieldset className="tabl" key={k}><legend>{label(f)}</legend>
            {f.help && <p className="help">{f.help}</p>}
            <div className="opts">
              {(f.options || []).map((o) => <label className="chk" key={o}><input type="radio" name={k} value={o} checked={vals[k] === o} onChange={() => { setOtherOn((p) => ({ ...p, [k]: false })); set(k, o); }} /> {o}</label>)}
              {f.other && <>
                <label className="chk"><input type="radio" name={k} checked={!!otherOn[k]} onChange={() => { setOtherOn((p) => ({ ...p, [k]: true })); set(k, other[k] ? `Autre : ${other[k]}` : ""); }} /> Autre :</label>
                <input className="inline" aria-label="Autre" disabled={!otherOn[k]} value={other[k] ?? ""} onChange={(e) => { setOther((p) => ({ ...p, [k]: e.target.value })); set(k, e.target.value.trim() ? `Autre : ${e.target.value.trim()}` : ""); }} />
              </>}
            </div>
          </fieldset>
        );
      case "checkbox": {
        const cur: string[] = vals[k] || [];
        const toggle = (o: string, on: boolean) => set(k, on ? [...cur, o] : cur.filter((x) => x !== o));
        return (
          <fieldset className="tabl" key={k}><legend>{label(f)}</legend>
            {f.help && <p className="help">{f.help}</p>}
            <div className="opts col">
              {(f.options || []).map((o) => <label className="chk" key={o}><input type="checkbox" name={k} value={o} checked={cur.includes(o)} onChange={(e) => toggle(o, e.target.checked)} /> {o}</label>)}
              {f.other && <div className="opts">
                <label className="chk"><input type="checkbox" checked={!!otherOn[k]} onChange={(e) => { setOtherOn((p) => ({ ...p, [k]: e.target.checked })); set(k, e.target.checked ? (other[k]?.trim() ? [...cur.filter((x) => !x.startsWith("Autre : ")), `Autre : ${other[k].trim()}`] : cur) : cur.filter((x) => !x.startsWith("Autre : "))); }} /> Autre :</label>
                <input className="inline" aria-label="Autre" disabled={!otherOn[k]} value={other[k] ?? ""} onChange={(e) => { const t = e.target.value; setOther((p) => ({ ...p, [k]: t })); set(k, [...cur.filter((x) => !x.startsWith("Autre : ")), ...(t.trim() ? [`Autre : ${t.trim()}`] : [])]); }} />
              </div>}
            </div>
          </fieldset>
        );
      }
      case "file":
        return (
          <label key={k}>{label(f)}
            <input name={k} type="file" accept="image/*,application/pdf" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) { setFiles((p) => { const n = { ...p }; delete n[k]; return n; }); return; }
              try {
                const prepared = await prepare(file);
                if (prepared.size > FILE_MAX) throw new Error("Fichier trop lourd (3 Mo maximum)");
                setFiles((p) => ({ ...p, [k]: prepared }));
                setMsg({ t: "", s: "" });
              } catch (err: any) { e.target.value = ""; setMsg({ t: "err", s: err.message }); }
            }} />
            {f.help && <small>{f.help}</small>}
          </label>
        );
      case "consent":
        return <label className="chk" key={k}><input type="checkbox" name={k} checked={!!vals[k]} onChange={(e) => set(k, e.target.checked)} /> <span>{f.label}{f.required && <span className="req"> *</span>}</span></label>;
      default:
        return <label key={k}>{label(f)}<input name={k} type={f.type === "number" ? "number" : f.type} value={vals[k] ?? ""} onChange={(e) => set(k, e.target.value)} />{f.help && <small>{f.help}</small>}</label>;
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { errors } = validate(fields, vals, (k) => !!files[k]);
    if (errors.length) { setMsg({ t: "err", s: `Merci de compléter le formulaire. ${errors[0]}.` }); return; }
    setBusy(true); setMsg({ t: "", s: "Envoi…" });
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
      window.scrollTo({ top: document.getElementById("inscription")!.offsetTop - 80, behavior: "smooth" });
    } catch (err: any) {
      setMsg({ t: "err", s: `Échec de l'envoi : ${err.message}.${infoline ? ` Réessaie ou appelle l'Infoline : ${infoline}.` : ""}` });
    } finally { setBusy(false); }
  }

  if (done) return <div className="card"><p className="msg ok" style={{ fontSize: 19 }}>{msg.s}</p></div>;
  return (
    <form className="card form" onSubmit={submit} noValidate>
      {fields.filter((f) => isVisible(f, vals)).map(renderField)}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999 }} />
      <button className="btn primary" disabled={busy}>{busy ? "Envoi…" : "Valider l'inscription"}</button>
      {msg.s && <p className={"msg " + msg.t} role="status">{msg.s}</p>}
    </form>
  );
}
