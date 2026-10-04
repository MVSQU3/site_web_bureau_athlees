import { q } from "@/lib/db";
import { fmtDate } from "@/lib/util";
import EventCard from "@/components/EventCard";
import { PageHead } from "@/components/ui";

export const metadata = { title: "Actualités" };

export default async function News() {
  const [events, news] = await Promise.all([
    q("select * from events where published and start_date >= current_date - 1 order by start_date asc"),
    q("select * from news where published order by date desc, id desc"),
  ]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <PageHead eyebrow="Actualités" title="Ce qui se passe." />
      <div className="space-y-5">
        {events.map((e: any) => <EventCard key={e.id} e={e} />)}
        {news.map((n: any) => (
          <article className="card bg-base-200" key={n.id}>
            <div className="card-body">
              {n.image && <img className="mb-3 w-full rounded-xl" src={n.image} alt="" />}
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{fmtDate(n.date)}</p>
              <h3 className="card-title">{n.title}</h3>
              <p className="whitespace-pre-line text-base-content/60">{n.body}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
