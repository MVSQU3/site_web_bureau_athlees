import { q } from "@/lib/db";
import { fmtDate } from "@/lib/util";
import EventCard from "@/components/EventCard";

export const metadata = { title: "Actualités" };

export default async function News() {
  const [events, news] = await Promise.all([
    q("select * from events where published and start_date >= current_date - 1 order by start_date asc"),
    q("select * from news where published order by date desc, id desc"),
  ]);
  return (
    <div className="page"><div className="wrap">
      <p className="eyebrow">Actualités</p>
      <h1 className="h1s">Ce qui se passe.</h1>
      <div className="list">
        {events.map((e: any) => <EventCard key={e.id} e={e} />)}
        {news.map((n: any) => (
          <article className="card" key={n.id}>
            {n.image && <img className="news-img" src={n.image} alt="" />}
            <p className="date">{fmtDate(n.date)}</p><h3>{n.title}</h3><p style={{ whiteSpace: "pre-line" }}>{n.body}</p>
          </article>
        ))}
      </div>
    </div></div>
  );
}
