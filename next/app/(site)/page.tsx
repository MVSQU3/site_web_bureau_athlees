import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { q } from "@/lib/db";
import { settings, lines, fmtDate } from "@/lib/util";
import EventCard from "@/components/EventCard";
import { SectionTitle } from "@/components/ui";

export default async function Home() {
  const [s, events, news, next] = await Promise.all([
    settings(),
    q("select * from events where published and start_date >= current_date - 1 order by start_date asc"),
    q("select * from news where published order by date desc, id desc limit 3"),
    q("select * from calendar where date >= current_date order by date asc limit 1"),
  ]);
  return (
    <>
      <section className="bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--color-secondary)_20%,transparent),transparent_70%)] px-4 pb-14 pt-20 text-center sm:pt-28">
        <img className="mx-auto mb-6 size-28 rounded-full shadow-2xl sm:size-36" src="/logo.png" alt="FIBAD – Commission des Athlètes" width={144} height={144} />
        <p className="mb-2 text-lg font-semibold text-secondary">{s.site_name} · {s.tagline}</p>
        <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">La voix des athlètes.<br /><span className="bg-gradient-to-r from-secondary via-base-content to-accent bg-clip-text text-transparent">Sur chaque volant.</span></h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-base-content/60">{s.hero_lead}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="btn btn-primary btn-lg rounded-full" href="/athletes">Découvrir les athlètes</Link>
          <Link className="btn btn-ghost btn-lg rounded-full text-primary" href="/contact">Adhérer <ArrowRight size={18} /></Link>
        </div>
      </section>
      <div className="mx-auto max-w-6xl space-y-6 px-4">{events.map((e: any) => <EventCard key={e.id} e={e} />)}</div>
      <section className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-4 px-4 sm:grid-cols-3">
        {lines(s.stats).map(([v, l]) => <div key={l} className="border-t border-base-300 py-8 text-center"><div className="text-5xl font-bold">{v}</div><div className="text-sm text-base-content/60">{l}</div></div>)}
      </section>
      <div className="mx-auto max-w-6xl px-4 pb-20">
        <SectionTitle>À la une</SectionTitle>
        <div className="grid gap-5 md:grid-cols-3">
          {news.map((n: any) => (
            <Link key={n.id} href="/actualites" className="card bg-base-200 transition hover:scale-[1.02] hover:bg-base-300">
              <div className="card-body"><p className="text-xs font-semibold uppercase tracking-wide text-secondary">{fmtDate(n.date)}</p><h3 className="card-title">{n.title}</h3><p className="line-clamp-4 text-sm text-base-content/60">{n.body}</p></div>
            </Link>
          ))}
        </div>
        <SectionTitle>Prochaine compétition</SectionTitle>
        {next[0]
          ? <div className="card bg-base-200"><div className="card-body flex-row items-center gap-6"><CalendarDays className="text-secondary" size={32} /><div><div className="text-sm font-semibold uppercase text-secondary">{fmtDate(next[0].date)}</div><h3 className="text-xl font-semibold">{next[0].title}</h3><p className="text-base-content/60">{next[0].place}</p></div></div></div>
          : <p className="py-10 text-center text-base-content/60">Aucune compétition programmée.</p>}
      </div>
    </>
  );
}
