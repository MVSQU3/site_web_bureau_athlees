"use client";
import { useState } from "react";
import { TYPE_LABELS, slugify, type Field, type FieldType } from "@/lib/forms";
import { ArrowUp, ArrowDown, Trash2, Plus, Save } from "lucide-react";
import ImageField from "./ImageField";
import { Field as Lbl } from "./ui";

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

  const inp = "input w-full text-base";
  const tog = "label cursor-pointer justify-start gap-3 text-base text-base-content";
  return (
    <form action={action} className="card max-w-4xl bg-base-200">
      <div className="card-body gap-4">
        <h2 className="text-xl font-semibold">Informations</h2>
        <Lbl label="Titre" required><input className={inp} name="title" required defaultValue={ev.title} /></Lbl>
        <Lbl label="Adresse de la page (laisser vide = automatique)"><input className={inp} name="slug" defaultValue={ev.slug} placeholder="ex : open-de-l-amitie-2026" /></Lbl>
        <Lbl label="Texte de présentation"><textarea className="textarea h-28 w-full text-base" name="hook" defaultValue={ev.hook} /></Lbl>
        <ImageField name="poster" label="Affiche" value={ev.poster} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Lbl label="Date(s) affichée(s)"><input className={inp} name="dates_label" defaultValue={ev.dates_label} placeholder="Samedi 24 octobre 2026" /></Lbl>
          <Lbl label="Lieu"><input className={inp} name="place" defaultValue={ev.place} /></Lbl>
          <Lbl label="Date de début (sert au classement)" required><input className={inp} name="start_date" type="date" required defaultValue={D(ev.start_date)} /></Lbl>
          <Lbl label="Date limite d'inscription (vide = pas de limite)"><input className={inp} name="deadline" type="date" defaultValue={D(ev.deadline)} /></Lbl>
          <Lbl label="Tarif affiché"><input className={inp} name="price_label" defaultValue={ev.price_label} placeholder="20 000 FCFA par paire" /></Lbl>
          <Lbl label="Infoline / téléphone"><input className={inp} name="infoline" defaultValue={ev.infoline} /></Lbl>
          <Lbl label="Nombre de places (vide = illimité)"><input className={inp} name="capacity" type="number" min={1} defaultValue={ev.capacity ?? ""} /></Lbl>
          <Lbl label="Message de confirmation"><input className={inp} name="confirmation" defaultValue={ev.confirmation} /></Lbl>
        </div>
        <Lbl label="Informations en plus (une par ligne : Titre | Valeur)"><textarea className="textarea h-20 w-full text-base" name="extra" defaultValue={extra} placeholder="Âge | À partir de 7 ans" /></Lbl>
        <Lbl label="Programme (une ligne par bloc : Jour | Discipline | Tableaux séparés par des virgules)"><textarea className="textarea h-20 w-full text-base" name="programme" defaultValue={prog} placeholder="24 octobre | Doubles | Double Hommes, Double Mixte" /></Lbl>
        <div className="flex flex-wrap gap-x-8">
          <label className={tog}><input type="checkbox" className="toggle toggle-primary" name="published" defaultChecked={ev.published} />Publié sur le site</label>
          <label className={tog}><input type="checkbox" className="toggle toggle-primary" name="registrations_open" defaultChecked={ev.registrations_open} />Inscriptions ouvertes</label>
        </div>

        <div className="divider" />
        <h2 className="text-xl font-semibold">Formulaire d&apos;inscription</h2>
        <p className="-mt-2 text-sm text-base-content/60">Ajoute, ordonne et configure les questions. « Afficher seulement si » permet de masquer une question selon une réponse précédente.</p>
        {fields.map((f, i) => {
          const prev = fields.slice(0, i).filter((x) => x.type !== "section" && x.type !== "file");
          const dep = prev.find((x) => keyOf(x) === f.showIf?.key);
          return (
            <div className="rounded-box border border-base-300 bg-base-100 p-4" key={i}>
              <div className="grid items-end gap-3 sm:grid-cols-[2fr_1.2fr_auto]">
                <Lbl label={f.type === "section" ? "Titre de la section" : "Question"}><input className="input w-full" value={f.label} onChange={(e) => upd(i, { label: e.target.value })} /></Lbl>
                <Lbl label="Type"><select className="select w-full" value={f.type} onChange={(e) => upd(i, { type: e.target.value as FieldType, ...(withOptions.includes(e.target.value) && !f.options?.length ? { options: ["Option 1", "Option 2"] } : {}) })}>{Object.entries(TYPE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Lbl>
                <div className="join">
                  <button type="button" className="btn join-item btn-sm" onClick={() => move(i, -1)} aria-label="Monter"><ArrowUp size={16} /></button>
                  <button type="button" className="btn join-item btn-sm" onClick={() => move(i, 1)} aria-label="Descendre"><ArrowDown size={16} /></button>
                  <button type="button" className="btn join-item btn-sm btn-error btn-outline" onClick={() => setFields((fs) => fs.filter((_, j) => j !== i))} aria-label="Supprimer"><Trash2 size={16} /></button>
                </div>
              </div>
              {f.type !== "section" && <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1">
                <label className="label cursor-pointer gap-2 text-base-content"><input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={!!f.required} onChange={(e) => upd(i, { required: e.target.checked })} />Obligatoire</label>
                {(f.type === "radio" || f.type === "checkbox") && <label className="label cursor-pointer gap-2 text-base-content"><input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={!!f.other} onChange={(e) => upd(i, { other: e.target.checked })} />Proposer « Autre : … »</label>}
                <span className="text-xs text-base-content/50">identifiant : {keyOf(f)}</span>
              </div>}
              {withOptions.includes(f.type) && <Lbl label="Choix (un par ligne)" className="mt-3"><textarea className="textarea w-full" rows={Math.min(8, (f.options?.length || 2) + 1)} value={(f.options || []).join("\n")} onChange={(e) => upd(i, { options: e.target.value.split("\n") })} /></Lbl>}
              <div className="collapse collapse-arrow mt-2 border border-base-300">
                <input type="checkbox" aria-label="Aide et affichage conditionnel" />
                <div className="collapse-title text-sm text-primary">Aide, affichage conditionnel</div>
                <div className="collapse-content space-y-3">
                  <Lbl label="Texte d'aide (facultatif)"><input className="input w-full" value={f.help || ""} onChange={(e) => upd(i, { help: e.target.value })} /></Lbl>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Lbl label="Afficher seulement si la question…">
                      <select className="select w-full" value={f.showIf?.key || ""} onChange={(e) => upd(i, { showIf: e.target.value ? { key: e.target.value, in: f.showIf?.in || [] } : undefined })}>
                        <option value="">— toujours affichée —</option>
                        {prev.map((x) => <option key={keyOf(x)} value={keyOf(x)}>{x.label.slice(0, 60)}</option>)}
                      </select>
                    </Lbl>
                    {f.showIf?.key && <Lbl label="…a pour réponse (une par ligne)"><textarea className="textarea w-full" rows={3} value={f.showIf.in.join("\n")} placeholder={dep?.options?.join("\n")} onChange={(e) => upd(i, { showIf: { key: f.showIf!.key, in: e.target.value.split("\n") } })} /></Lbl>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div className="flex flex-wrap items-center gap-2">
          <select id="newtype" className="select w-auto" defaultValue="text">{Object.entries(TYPE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <button type="button" className="btn btn-outline" onClick={() => add((document.getElementById("newtype") as HTMLSelectElement).value as FieldType)}><Plus size={16} />Ajouter une question</button>
        </div>
        <input type="hidden" name="form" value={JSON.stringify(fields.map((f) => ({ ...f, key: keyOf(f), options: f.options?.map((o) => o.trim()).filter(Boolean), showIf: f.showIf?.in?.some((x) => x.trim()) ? { key: f.showIf.key, in: f.showIf.in.map((x) => x.trim()).filter(Boolean) } : undefined })))} />
        <Lbl label="Détection des doublons : identifiants des questions séparés par des virgules" help="Deux inscriptions avec les mêmes valeurs sur ces questions sont refusées."><input className={inp} name="dedupe" defaultValue={(ev.dedupe || []).join(", ")} placeholder="nom, naissance" /></Lbl>
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn btn-primary rounded-full"><Save size={16} />Enregistrer</button>
          <a className="btn btn-ghost rounded-full" href="/admin/events">Annuler</a>
          <span className="flex-1" />
          {onDelete && <button type="submit" className="btn btn-error btn-outline rounded-full" formAction={onDelete as any} onClick={(e) => { if (!confirm("Supprimer cet événement ET toutes ses inscriptions ?")) e.preventDefault(); }}><Trash2 size={16} />Supprimer l&apos;événement</button>}
        </div>
      </div>
    </form>
  );
}
