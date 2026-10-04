import Link from "next/link";
import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtDate } from "@/lib/util";

export default async function Registrations() {
  await requireUser("admin");
  const evs = await q("select e.id, e.title, e.start_date, e.capacity, count(r.id) filter (where r.status = 'inscrit')::int ok, count(r.id) filter (where r.status = 'liste_attente')::int wait, count(r.id)::int total from events e left join registrations r on r.event_id = e.id group by e.id order by e.start_date desc");
  return (
    <>
      <h1>Inscriptions</h1>
      <p className="sub-h">Choisis un événement.</p>
      {evs.map((e: any) => (
        <Link key={e.id} href={`/admin/registrations/${e.id}`} className="acard arow">
          <div><b>{e.title}</b><div className="meta">{fmtDate(e.start_date)}</div></div>
          <div style={{ textAlign: "right" }}><b>{e.ok}{e.capacity ? ` / ${e.capacity}` : ""}</b> inscrits{e.wait > 0 && <div className="meta">{e.wait} en liste d&apos;attente</div>}</div>
        </Link>
      ))}
    </>
  );
}
