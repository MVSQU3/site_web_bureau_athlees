"use client";
import { useState } from "react";
import { TYPE_LABELS, slugify, type Field, type FieldType } from "@/lib/forms";
import ImageField from "./ImageField";

const withOptions = ["radio", "checkbox", "select"];

export default function EventEditor({ ev, action, onDelete }: { ev: any; action: (f: FormData) => void; onDelete?: (() => void) | null }) {
  const [fields, setFields] = useState<Field[]>(ev.form || []);
  const upd = (i: number, p: Partial<Field>) => setFields((fs) => fs.map((f, j) => (j === i ? { ...f, ...p } : f)));
  const move = (i: number, d: number) => setFields((fs) => { const a = [...fs]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });
  const add = (type: FieldType) => setFields((fs) => [...fs, { key: "", label: type === "section" ? "Nouvelle section" : "Nouvelle question", type, ...(withOptions.includes(type) ? { options: ["Option 1", "Option 2"] } : {}) }]);
  const keyOf = (f: Field) => f.key || slugify(f.label);
  const extra = (ev.extra || []).map((p: string[]) => p.join(" | ")).join("\n");
  const prog = (ev.programme || []).map((p: any) => [p.jour, p.discipline, (p.tableaux || []).join(", ")].join(" | ")).join("\n");
  const D = (v: any) => (v ? String(v).slice(0, 10) : "");

  return (
    <form action={action} className="acard" style={{ maxWidth: 820 }}>
      <h2 style={{ fontSize: 20, marginBottom: 14 }}>Informations</h2>
      <label className="afield">Titre *<input name="title" required defaultValue={ev.title} /></label>
      <label className="afield">Adresse de la page (laisser vide = automatique)<input name="slug" defaultValue={ev.slug} placeholder="ex : open-de-l-amitie-2026" /></label>
      <label className="afield">Texte de présentation<textarea name="hook" rows={4} defaultValue={ev.hook} /></label>
      <ImageField name="poster" label="Affiche" value={ev.poster} />
      <div className="fb-item" style={{ border: 0, padding: 0, background: "none" }}><div className="g2" style={{ marginTop: 0 }}>
        <label className="afield">Date(s) affichée(s)<input name="dates_label" defaultValue={ev.dates_label} placeholder="Samedi 24 octobre 2026" /></label>
        <label className="afield">Lieu<input name="place" defaultValue={ev.place} /></label>
        <label className="afield">Date de début * (sert au classement)<input name="start_date" type="date" required defaultValue={D(ev.start_date)} /></label>
        <label className="afield">Date limite d&apos;inscription (vide = pas de limite)<input name="deadline" type="date" defaultValue={D(ev.deadline)} /></label>
        <label className="afield">Tarif affiché<input name="price_label" defaultValue={ev.price_label} placeholder="20 000 FCFA par paire" /></label>
        <label className="afield">Infoline / téléphone<input name="infoline" defaultValue={ev.infoline} /></label>
        <label className="afield">Nombre de places (vide = illimité)<input name="capacity" type="number" min={1} defaultValue={ev.capacity ?? ""} /></label>
        <label className="afield">Message de confirmation<input name="confirmation" defaultValue={ev.confirmation} /></label>
      </div></div>
      <label className="afield">Informations en plus (une par ligne : Titre | Valeur)<textarea name="extra" rows={3} defaultValue={extra} placeholder="Âge | À partir de 7 ans" /></label>
      <label className="afield">Programme (une ligne par bloc : Jour | Discipline | Tableaux séparés par des virgules)<textarea name="programme" rows={3} defaultValue={prog} placeholder="24 octobre | Doubles | Double Hommes, Double Mixte" /></label>
      <div className="arow" style={{ justifyContent: "flex-start", gap: 24, marginBottom: 20 }}>
        <label className="chk" style={{ display: "flex", gap: 8 }}><input type="checkbox" name="published" defaultChecked={ev.published} style={{ width: 18 }} /> Publié sur le site</label>
        <label className="chk" style={{ display: "flex", gap: 8 }}><input type="checkbox" name="registrations_open" defaultChecked={ev.registrations_open} style={{ width: 18 }} /> Inscriptions ouvertes</label>
      </div>

      <h2 style={{ fontSize: 20, margin: "26px 0 6px" }}>Formulaire d&apos;inscription</h2>
      <p className="meta" style={{ marginBottom: 14 }}>Ajoute, ordonne et configure les questions. « Afficher seulement si » permet de masquer une question selon une réponse précédente.</p>
      {fields.map((f, i) => {
        const prev = fields.slice(0, i).filter((x) => x.type !== "section" && x.type !== "file");
        const dep = prev.find((x) => keyOf(x) === f.showIf?.key);
        return (
          <div className="fb-item" key={i}>
            <div className="g">
              <label className="afield" style={{ margin: 0 }}>{f.type === "section" ? "Titre de la section" : "Question"}<input value={f.label} onChange={(e) => upd(i, { label: e.target.value })} /></label>
              <label className="afield" style={{ margin: 0 }}>Type<select value={f.type} onChange={(e) => upd(i, { type: e.target.value as FieldType, ...(withOptions.includes(e.target.value) && !f.options?.length ? { options: ["Option 1", "Option 2"] } : {}) })}>{Object.entries(TYPE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
              <div style={{ whiteSpace: "nowrap" }}>
                <button type="button" className="abtn ghost sm" onClick={() => move(i, -1)} aria-label="Monter">↑</button>{" "}
                <button type="button" className="abtn ghost sm" onClick={() => move(i, 1)} aria-label="Descendre">↓</button>{" "}
                <button type="button" className="abtn danger sm" onClick={() => setFields((fs) => fs.filter((_, j) => j !== i))} aria-label="Supprimer">✕</button>
              </div>
            </div>
            {f.type !== "section" && <div className="arow" style={{ justifyContent: "flex-start", gap: 20, marginTop: 10 }}>
              <label className="chk" style={{ display: "flex", gap: 6, alignItems: "center" }}><input type="checkbox" checked={!!f.required} onChange={(e) => upd(i, { required: e.target.checked })} style={{ width: 16 }} /> Obligatoire</label>
              {(f.type === "radio" || f.type === "checkbox") && <label className="chk" style={{ display: "flex", gap: 6, alignItems: "center" }}><input type="checkbox" checked={!!f.other} onChange={(e) => upd(i, { other: e.target.checked })} style={{ width: 16 }} /> Proposer « Autre : … »</label>}
              <span className="meta">identifiant : {keyOf(f)}</span>
            </div>}
            {withOptions.includes(f.type) && <label className="afield" style={{ margin: "10px 0 0" }}>Choix (un par ligne)<textarea rows={Math.min(8, (f.options?.length || 2) + 1)} value={(f.options || []).join("\n")} onChange={(e) => upd(i, { options: e.target.value.split("\n") })} /></label>}
            <details style={{ marginTop: 10 }}><summary>Aide, affichage conditionnel</summary>
              <label className="afield" style={{ margin: "10px 0 0" }}>Texte d&apos;aide (facultatif)<input value={f.help || ""} onChange={(e) => upd(i, { help: e.target.value })} /></label>
              <div className="g2">
                <label className="afield" style={{ margin: 0 }}>Afficher seulement si la question…
                  <select value={f.showIf?.key || ""} onChange={(e) => upd(i, { showIf: e.target.value ? { key: e.target.value, in: f.showIf?.in || [] } : undefined })}>
                    <option value="">— toujours affichée —</option>
                    {prev.map((x) => <option key={keyOf(x)} value={keyOf(x)}>{x.label.slice(0, 60)}</option>)}
                  </select></label>
                {f.showIf?.key && <label className="afield" style={{ margin: 0 }}>…a pour réponse (une par ligne)
                  {dep?.options?.length ? <textarea rows={3} value={f.showIf.in.join("\n")} onChange={(e) => upd(i, { showIf: { key: f.showIf!.key, in: e.target.value.split("\n") } })} placeholder={dep.options.join("\n")} /> : <textarea rows={2} value={f.showIf.in.join("\n")} onChange={(e) => upd(i, { showIf: { key: f.showIf!.key, in: e.target.value.split("\n") } })} />}
                </label>}
              </div>
            </details>
          </div>
        );
      })}
      <div className="adm-bar">
        <select id="newtype" defaultValue="text" style={{ width: "auto" }}>{Object.entries(TYPE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <button type="button" className="abtn ghost" onClick={() => add((document.getElementById("newtype") as HTMLSelectElement).value as FieldType)}>+ Ajouter une question</button>
      </div>
      <input type="hidden" name="form" value={JSON.stringify(fields.map((f) => ({ ...f, key: keyOf(f), options: f.options?.map((o) => o.trim()).filter(Boolean), showIf: f.showIf?.in?.some((x) => x.trim()) ? { key: f.showIf.key, in: f.showIf.in.map((x) => x.trim()).filter(Boolean) } : undefined })))} />
      <label className="afield">Détection des doublons : identifiants des questions séparés par des virgules<input name="dedupe" defaultValue={(ev.dedupe || []).join(", ")} placeholder="nom, naissance" /><small>Deux inscriptions avec les mêmes valeurs sur ces questions sont refusées.</small></label>
      <div className="adm-bar" style={{ marginBottom: 0 }}>
        <button className="abtn">Enregistrer</button>
        <a className="abtn ghost" href="/admin/events">Annuler</a>
        <span className="sp" />
        {onDelete && <button type="submit" className="abtn danger" formAction={onDelete as any} onClick={(e) => { if (!confirm("Supprimer cet événement ET toutes ses inscriptions ?")) e.preventDefault(); }}>Supprimer l&apos;événement</button>}
      </div>
    </form>
  );
}
