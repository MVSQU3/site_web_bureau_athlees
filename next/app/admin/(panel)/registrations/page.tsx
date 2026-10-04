import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtDate } from "@/lib/util";

export default async function Registrations() {
  await requireUser("admin");
  const evs = await q("select e.id, e.title, e.start_date, e.capacity, count(r.id) filter (where r.status = 'inscrit')::int ok, count(r.id) filter (where r.status = 'liste_attente')::int wait, count(r.id)::int total from events e left join registrations r on r.event_id = e.id group by e.id order by e.start_date desc");
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Inscriptions</h1>
      <p className="mb-6 mt-1 text-base-content/60">Choisis un événement.</p>
      <div className="space-y-3">
        {evs.map((e: any) => (
          <Link key={e.id} href={`/admin/registrations/${e.id}`} className="card bg-base-200 transition hover:bg-base-300">
            <div className="card-body flex-row items-center justify-between gap-4 py-4">
              <div><b>{e.title}</b><div className="text-sm text-base-content/60">{fmtDate(e.start_date)}</div></div>
              <div className="flex items-center gap-3 text-right"><div><b>{e.ok}{e.capacity ? ` / ${e.capacity}` : ""}</b> inscrits{e.wait > 0 && <div className="text-sm text-warning">{e.wait} en liste d&apos;attente</div>}</div><ChevronRight size={18} className="opacity-50" /></div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
