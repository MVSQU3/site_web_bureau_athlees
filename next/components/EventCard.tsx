import Link from "next/link";
import { eventStatus, fmtDate, telHref } from "@/lib/util";

export default function EventCard({ e, detail = false }: { e: any; detail?: boolean }) {
  const open = eventStatus(e) === "open";
  return (
    <article className="event">
      {e.poster && <a className="event-img" href={e.poster} target="_blank" rel="noopener"><img src={e.poster} alt={`Affiche : ${e.title}`} loading="lazy" /></a>}
      <div className="event-body">
        <p className="eyebrow">Événement</p>
        <h2>{detail ? e.title : <Link href={`/evenements/${e.slug}`}>{e.title}</Link>}</h2>
        {e.hook && <p>{e.hook}</p>}
        <ul className="event-facts">
          <li><b>Dates</b>{e.dates_label}</li>
          <li><b>Lieu</b>{e.place}</li>
          {(e.extra || []).map(([k, v]: string[]) => <li key={k}><b>{k}</b>{v}</li>)}
          {e.price_label && <li><b>Participation</b>{e.price_label}</li>}
          {e.deadline && <li><b>Inscriptions</b>jusqu&apos;au {fmtDate(e.deadline)}</li>}
          {e.infoline && <li><b>Infoline</b><a href={telHref(e.infoline)}>{e.infoline}</a></li>}
        </ul>
        {(e.programme || []).length > 0 && (
          <div className="event-prog">
            {e.programme.map((p: any, i: number) => <div key={i}><span className="date">{p.jour}</span><h3>{p.discipline}</h3><p>{(p.tableaux || []).join(" · ")}</p></div>)}
          </div>
        )}
        <div className="btns left">
          {open
            ? <Link className="btn primary" href={`/evenements/${e.slug}${detail ? "#inscription" : ""}`}>{detail ? "S'inscrire ↓" : "S'inscrire ›"}</Link>
            : <span className="tag">Inscriptions closes</span>}
        </div>
      </div>
    </article>
  );
}
