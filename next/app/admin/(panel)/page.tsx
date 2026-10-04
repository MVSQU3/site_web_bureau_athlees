import Link from "next/link";
import { ClipboardList, MessageSquare, CalendarCheck, Newspaper, Trophy } from "lucide-react";
import { q, one } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export default async function Dashboard() {
  const u = await requireUser();
  const admin = u.role === "admin";
  const [c, evs] = await Promise.all([
    one<any>(`select (select count(*)::int from registrations) regs, (select count(*)::int from messages where not handled) msgs, (select count(*)::int from news) news, (select count(*)::int from athletes) ath, (select count(*)::int from events where published) evs`),
    admin ? q("select e.id, e.title, e.capacity, count(r.id) filter (where r.status <> 'annule')::int n from events e left join registrations r on r.event_id = e.id group by e.id order by e.start_date desc") : Promise.resolve([]),
  ]);
  const Stat = ({ icon: I, v, l }: any) => <div className="stat rounded-box bg-base-200"><div className="stat-figure text-secondary"><I size={28} /></div><div className="stat-value">{v}</div><div className="stat-desc text-sm">{l}</div></div>;
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Bonjour {u.name || u.email} 👋</h1>
      <p className="mb-8 mt-1 text-base-content/60">Vue d&apos;ensemble du site.</p>
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {admin && <Stat icon={ClipboardList} v={c.regs} l="inscriptions" />}
        {admin && <Stat icon={MessageSquare} v={c.msgs} l="messages non traités" />}
        <Stat icon={CalendarCheck} v={c.evs} l="événements publiés" />
        <Stat icon={Newspaper} v={c.news} l="actualités" />
        <Stat icon={Trophy} v={c.ath} l="athlètes" />
      </div>
      {admin && <>
        <h2 className="mb-3 text-xl font-semibold">Inscriptions par événement</h2>
        <div className="space-y-2">
          {evs.map((e: any) => <Link key={e.id} href={`/admin/registrations/${e.id}`} className="card bg-base-200 transition hover:bg-base-300"><div className="card-body flex-row items-center justify-between py-4"><span>{e.title}</span><span className="badge badge-primary badge-lg">{e.n}{e.capacity ? ` / ${e.capacity}` : ""}</span></div></Link>)}
        </div>
      </>}
    </>
  );
}
