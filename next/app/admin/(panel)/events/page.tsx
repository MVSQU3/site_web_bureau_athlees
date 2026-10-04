import Link from "next/link";
import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { eventStatus, fmtDate } from "@/lib/util";

export default async function Events() {
  const u = await requireUser();
  const rows = await q("select e.*, (select count(*)::int from registrations r where r.event_id = e.id and r.status <> 'annule') n from events e order by start_date desc");
  return (
    <>
      <div className="adm-bar"><h1>Événements</h1><span className="sp" /><Link className="abtn" href="/admin/events/new">+ Nouvel événement</Link></div>
      {rows.map((e: any) => (
        <div className="acard arow" key={e.id}>
          <div>
            <b>{e.title}</b> {!e.published && <span className="chip warn">Brouillon</span>} <span className={"chip " + (eventStatus(e) === "open" ? "ok" : "")}>{eventStatus(e) === "open" ? "Inscriptions ouvertes" : "Inscriptions closes"}</span>
            <div className="meta">{e.dates_label} · {e.place}{e.deadline && ` · limite ${fmtDate(e.deadline)}`}</div>
            {u.role === "admin" && <div className="meta">{e.n} inscription(s){e.capacity ? ` sur ${e.capacity} places` : ""}</div>}
          </div>
          <div>
            <a className="abtn ghost sm" href={`/evenements/${e.slug}`} target="_blank" rel="noopener">Voir</a>{" "}
            {u.role === "admin" && <Link className="abtn ghost sm" href={`/admin/registrations/${e.id}`}>Inscriptions</Link>}{" "}
            <Link className="abtn sm" href={`/admin/events/${e.id}`}>Modifier</Link>
          </div>
        </div>
      ))}
    </>
  );
}
