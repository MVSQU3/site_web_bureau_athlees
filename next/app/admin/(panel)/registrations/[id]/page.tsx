import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Search, Check, Undo2, Clock, XCircle, Trash2, Paperclip, UserCheck } from "lucide-react";
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
    if (f.type === "file") return r.files?.[f.key] ? <a className="link link-primary inline-flex items-center gap-1" href={`/admin/files/${r.files[f.key]}`} target="_blank" rel="noopener"><Paperclip size={14} />Voir le fichier</a> : "";
    return Array.isArray(v) ? v.join(" ; ") : v === true ? "Oui" : v ?? "";
  };
  const shown = all
    .filter((r) => !statut || r.status === statut)
    .filter((r) => !search || JSON.stringify(r.data).toLowerCase().includes(search.toLowerCase()))
    .reverse();
  const title = (r: any) => String(r.data[fields.find((f) => f.type === "text")?.key || ""] ?? "(sans nom)") + (r.data.prenoms ? " " + r.data.prenoms : "");
  const count = (s: string) => all.filter((r) => r.status === s).length;
  const paid = all.filter((r) => r.paid && r.status !== "annule").length;
  const Act = ({ action, icon: I, children, cls = "" }: any) => <form action={action} className="inline"><button className={"btn btn-ghost btn-xs " + cls}><I size={14} />{children}</button></form>;
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold tracking-tight">{ev.title}</h1><a className="btn btn-outline btn-sm" href={`/admin/export/${ev.id}`}><Download size={16} />Exporter en CSV</a></div>
      <div className="stats stats-vertical mb-6 w-full bg-base-200 sm:stats-horizontal">
        <div className="stat"><div className="stat-title">Inscrits</div><div className="stat-value text-3xl">{count("inscrit")}{ev.capacity ? <span className="text-lg text-base-content/50"> / {ev.capacity}</span> : null}</div></div>
        <div className="stat"><div className="stat-title">Liste d&apos;attente</div><div className="stat-value text-3xl">{count("liste_attente")}</div></div>
        <div className="stat"><div className="stat-title">Annulés</div><div className="stat-value text-3xl">{count("annule")}</div></div>
        <div className="stat"><div className="stat-title">Paiements confirmés</div><div className="stat-value text-3xl">{paid}</div></div>
      </div>
      <form className="mb-5 flex flex-wrap gap-2" method="get">
        <label className="input min-w-56 flex-1"><Search size={16} className="opacity-60" /><input name="q" defaultValue={search} placeholder="Rechercher (nom, club, téléphone…)" /></label>
        <select name="s" className="select w-auto" defaultValue={statut}><option value="">Tous les statuts</option>{Object.entries(STATUTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <button className="btn btn-outline">Filtrer</button>
        {(search || statut) && <Link className="btn btn-ghost" href={`/admin/registrations/${ev.id}`}>Effacer</Link>}
      </form>
      <div className="space-y-3">
        {shown.map((r) => (
          <div className="card bg-base-200" key={r.id}>
            <div className="card-body gap-3 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><b className="text-lg">{title(r)}</b>
                    {r.status !== "annule" && <span className="badge badge-neutral">N°{rank.get(r.id)}</span>}
                    <span className={"badge " + (r.status === "inscrit" ? "badge-success" : r.status === "liste_attente" ? "badge-warning" : "badge-ghost")}>{STATUTS[r.status]}</span>
                    {r.paid && <span className="badge badge-success badge-outline">Paiement confirmé</span>}
                  </div>
                  <div className="text-sm text-base-content/60">Inscrit(e) le {fmtDateTime(r.created_at)}</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Act action={setRegistration.bind(null, r.id, { paid: !r.paid })} icon={r.paid ? Undo2 : Check}>{r.paid ? "Annuler le paiement" : "Confirmer le paiement"}</Act>
                  {r.status !== "inscrit" && <Act action={setRegistration.bind(null, r.id, { status: "inscrit" })} icon={UserCheck}>Inscrit</Act>}
                  {r.status !== "liste_attente" && <Act action={setRegistration.bind(null, r.id, { status: "liste_attente" })} icon={Clock}>Attente</Act>}
                  {r.status !== "annule" && <Act action={setRegistration.bind(null, r.id, { status: "annule" })} icon={XCircle}>Annuler</Act>}
                  <Act action={deleteRegistration.bind(null, r.id)} icon={Trash2} cls="text-error">Supprimer</Act>
                </div>
              </div>
              <div className="collapse collapse-arrow border border-base-300 bg-base-100">
                <input type="checkbox" aria-label="Voir toutes les réponses" />
                <div className="collapse-title text-sm text-primary">Voir toutes les réponses</div>
                <div className="collapse-content overflow-x-auto">
                  <table className="table table-sm"><tbody>
                    {fields.filter((f) => f.type !== "section" && (r.data[f.key] !== undefined || r.files?.[f.key])).map((f) => <tr key={f.key}><th className="w-2/5 font-normal text-base-content/60">{f.label.slice(0, 120)}</th><td>{val(f, r)}</td></tr>)}
                  </tbody></table>
                </div>
              </div>
            </div>
          </div>
        ))}
        {shown.length === 0 && <p className="py-8 text-center text-base-content/60">Aucune inscription.</p>}
      </div>
    </>
  );
}
