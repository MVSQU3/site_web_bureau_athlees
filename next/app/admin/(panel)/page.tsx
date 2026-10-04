import Link from "next/link";
import { q, one } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export default async function Dashboard() {
  const u = await requireUser();
  const admin = u.role === "admin";
  const [c, evs] = await Promise.all([
    one<any>(`select (select count(*)::int from registrations) regs, (select count(*)::int from messages where not handled) msgs, (select count(*)::int from news) news, (select count(*)::int from athletes) ath, (select count(*)::int from events where published) evs`),
    admin ? q("select e.id, e.title, e.capacity, count(r.id) filter (where r.status <> 'annule')::int n from events e left join registrations r on r.event_id = e.id group by e.id order by e.start_date desc") : Promise.resolve([]),
  ]);
  return (
    <>
      <h1>Bonjour {u.name || u.email} 👋</h1>
      <p className="sub-h">Vue d&apos;ensemble du site.</p>
      <div className="stat-grid">
        {admin && <div className="stat-box"><b>{c.regs}</b><span>inscriptions</span></div>}
        {admin && <div className="stat-box"><b>{c.msgs}</b><span>messages non traités</span></div>}
        <div className="stat-box"><b>{c.evs}</b><span>événements publiés</span></div>
        <div className="stat-box"><b>{c.news}</b><span>actualités</span></div>
        <div className="stat-box"><b>{c.ath}</b><span>athlètes</span></div>
      </div>
      {admin && <>
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>Inscriptions par événement</h2>
        {evs.map((e: any) => <Link key={e.id} href={`/admin/registrations/${e.id}`} className="acard arow"><span>{e.title}</span><b>{e.n}{e.capacity ? ` / ${e.capacity}` : ""}</b></Link>)}
      </>}
    </>
  );
}
