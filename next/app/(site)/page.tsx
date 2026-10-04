import Link from "next/link";
import { q } from "@/lib/db";
import { settings, lines, fmtDate } from "@/lib/util";
import EventCard from "@/components/EventCard";

export default async function Home() {
  const [s, events, news, next] = await Promise.all([
    settings(),
    q("select * from events where published and start_date >= current_date - 1 order by start_date asc"),
    q("select * from news where published order by date desc, id desc limit 3"),
    q("select * from calendar where date >= current_date order by date asc limit 1"),
  ]);
  return (
    <div className="page">
      <div className="hero">
        <img className="hero-logo" src="/logo.png" alt="FIBAD – Commission des Athlètes" width={140} height={140} />
        <p className="eyebrow">{s.site_name} · {s.tagline}</p>
        <h1>La voix des athlètes.<br /><span className="grad">Sur chaque volant.</span></h1>
        <p className="lead">{s.hero_lead}</p>
        <div className="btns"><Link className="btn primary" href="/athletes">Découvrir les athlètes</Link><Link className="btn ghost" href="/contact">Adhérer ›</Link></div>
      </div>
      <div className="wrap">{events.map((e: any) => <EventCard key={e.id} e={e} />)}</div>
      <div className="wrap stats">
        {lines(s.stats).map(([v, l]) => <div className="stat" key={l}><b>{v}</b><span>{l}</span></div>)}
      </div>
      <div className="wrap">
        <h2 className="sec">À la une</h2>
        <div className="grid3">
          {news.map((n: any) => (
            <Link className="card" href="/actualites" key={n.id}><p className="date">{fmtDate(n.date)}</p><h3>{n.title}</h3><p>{n.body}</p></Link>
          ))}
        </div>
        <h2 className="sec">Prochaine compétition</h2>
        {next[0]
          ? <div className="card item hover"><div className="cal-d"><b>{new Date(next[0].date).getUTCDate()}</b><span>{new Date(next[0].date).toLocaleDateString("fr-FR", { month: "short", year: "numeric", timeZone: "UTC" })}</span></div><div><h3>{next[0].title}</h3><p>{next[0].place}</p></div></div>
          : <p className="empty">Aucune compétition programmée.</p>}
      </div>
    </div>
  );
}
