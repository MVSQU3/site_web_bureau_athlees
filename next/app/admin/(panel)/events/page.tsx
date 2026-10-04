import Link from "next/link";
import { Plus, ExternalLink, ClipboardList, Pencil } from "lucide-react";
import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { eventStatus, fmtDate } from "@/lib/util";

export default async function Events() {
  const u = await requireUser();
  const rows = await q("select e.*, (select count(*)::int from registrations r where r.event_id = e.id and r.status <> 'annule') n from events e order by start_date desc");
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3"><h1 className="text-3xl font-bold tracking-tight">Événements</h1><Link className="btn btn-primary btn-sm rounded-full" href="/admin/events/new"><Plus size={16} />Nouvel événement</Link></div>
      <div className="space-y-3">
        {rows.map((e: any) => {
          const open = eventStatus(e) === "open";
          return (
            <div className="card bg-base-200" key={e.id}>
              <div className="card-body flex-row flex-wrap items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><b>{e.title}</b>{!e.published && <span className="badge badge-warning badge-outline">Brouillon</span>}<span className={"badge badge-outline " + (open ? "badge-success" : "")}>{open ? "Inscriptions ouvertes" : "Inscriptions closes"}</span></div>
                  <div className="text-sm text-base-content/60">{e.dates_label} · {e.place}{e.deadline && ` · limite ${fmtDate(e.deadline)}`}</div>
                  {u.role === "admin" && <div className="text-sm text-base-content/60">{e.n} inscription(s){e.capacity ? ` sur ${e.capacity} places` : ""}</div>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <a className="btn btn-ghost btn-sm" href={`/evenements/${e.slug}`} target="_blank" rel="noopener"><ExternalLink size={14} />Voir</a>
                  {u.role === "admin" && <Link className="btn btn-ghost btn-sm" href={`/admin/registrations/${e.id}`}><ClipboardList size={14} />Inscriptions</Link>}
                  <Link className="btn btn-primary btn-sm" href={`/admin/events/${e.id}`}><Pencil size={14} />Modifier</Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
