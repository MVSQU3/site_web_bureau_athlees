import Link from "next/link";
import { notFound } from "next/navigation";
import { q, one } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtDateTime } from "@/lib/util";
import { setRegistration, deleteRegistration } from "@/lib/actions";
import type { Field } from "@/lib/forms";

const STATUTS: Record<string, string> = { inscrit: "Inscrit", liste_attente: "Liste d'attente", annule: "Annulé" };

export default async function EventRegistrations({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ q?: string; s?: string }> }) {
  await requireUser("admin");
  const { id } = await params;
  const { q: search = "", s: statut = "" } = await searchParams;
  const ev = await one<any>("select * from events where id = $1", [Number(id) || 0]);
  if (!ev) notFound();
  const all = await q<any>("select * from registrations where event_id = $1 order by created_at asc", [ev.id]);
  const rank = new Map<number, number>();
  all.filter((r) => r.status !== "annule").forEach((r, i) => rank.set(r.id, i + 1));
  const fields: Field[] = ev.form;
  const val = (f: Field, r: any) => {
    const v = r.data[f.key];
    if (f.type === "file") return r.files?.[f.key] ? <a href={`/admin/files/${r.files[f.key]}`} target="_blank" rel="noopener">Voir le fichier</a> : "";
    return Array.isArray(v) ? v.join(" ; ") : v === true ? "Oui" : v ?? "";
  };
  const shown = all
    .filter((r) => !statut || r.status === statut)
    .filter((r) => !search || JSON.stringify(r.data).toLowerCase().includes(search.toLowerCase()))
    .reverse();
  const title = (r: any) => String(r.data[fields.find((f) => f.type === "text")?.key || ""] ?? "(sans nom)") + (r.data.prenoms ? " " + r.data.prenoms : "");
  const count = (s: string) => all.filter((r) => r.status === s).length;
  const paid = all.filter((r) => r.paid && r.status !== "annule").length;
  return (
    <>
      <div className="adm-bar"><h1>{ev.title}</h1><span className="sp" /><a className="abtn ghost" href={`/admin/export/${ev.id}`}>Exporter en CSV</a></div>
      <div className="arow" style={{ justifyContent: "flex-start", gap: 8, marginBottom: 16 }}>
        <span className="chip">Inscrits : <b>{count("inscrit")}{ev.capacity ? ` / ${ev.capacity}` : ""}</b></span>
        <span className="chip">Liste d&apos;attente : <b>{count("liste_attente")}</b></span>
        <span className="chip">Annulés : <b>{count("annule")}</b></span>
        <span className="chip">Paiements confirmés : <b>{paid}</b></span>
      </div>
      <form className="adm-bar" method="get">
        <input name="q" defaultValue={search} placeholder="Rechercher (nom, club, téléphone…)" style={{ maxWidth: 320 }} />
        <select name="s" defaultValue={statut} style={{ width: "auto" }}><option value="">Tous les statuts</option>{Object.entries(STATUTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <button className="abtn ghost">Filtrer</button>
        {(search || statut) && <Link className="abtn ghost" href={`/admin/registrations/${ev.id}`}>Effacer</Link>}
      </form>
      {shown.map((r) => (
        <div className="acard" key={r.id}>
          <div className="arow">
            <div>
              <b>{title(r)}</b>{" "}
              {r.status !== "annule" && <span className="chip">N°{rank.get(r.id)}</span>}
              <span className={"chip " + (r.status === "inscrit" ? "ok" : r.status === "liste_attente" ? "warn" : "")}>{STATUTS[r.status]}</span>
              {r.paid && <span className="chip ok">Paiement confirmé</span>}
              <div className="meta">Inscrit(e) le {fmtDateTime(r.created_at)}</div>
            </div>
            <div style={{ whiteSpace: "nowrap" }}>
              <form action={setRegistration.bind(null, r.id, { paid: !r.paid })} style={{ display: "inline" }}><button className="abtn ghost sm">{r.paid ? "Annuler le paiement" : "Confirmer le paiement"}</button></form>{" "}
              {r.status !== "inscrit" && <form action={setRegistration.bind(null, r.id, { status: "inscrit" })} style={{ display: "inline" }}><button className="abtn ghost sm">→ Inscrit</button></form>}{" "}
              {r.status !== "liste_attente" && <form action={setRegistration.bind(null, r.id, { status: "liste_attente" })} style={{ display: "inline" }}><button className="abtn ghost sm">→ Attente</button></form>}{" "}
              {r.status !== "annule" && <form action={setRegistration.bind(null, r.id, { status: "annule" })} style={{ display: "inline" }}><button className="abtn ghost sm">Annuler</button></form>}{" "}
              <form action={deleteRegistration.bind(null, r.id)} style={{ display: "inline" }}><button className="abtn danger sm">Supprimer</button></form>
            </div>
          </div>
          <details style={{ marginTop: 10 }}><summary>Voir toutes les réponses</summary>
            <table className="t"><tbody>
              {fields.filter((f) => f.type !== "section" && (r.data[f.key] !== undefined || r.files?.[f.key])).map((f) => <tr key={f.key}><th style={{ width: "42%" }}>{f.label.slice(0, 120)}</th><td>{val(f, r)}</td></tr>)}
            </tbody></table>
          </details>
        </div>
      ))}
      {shown.length === 0 && <p className="meta">Aucune inscription.</p>}
    </>
  );
}
