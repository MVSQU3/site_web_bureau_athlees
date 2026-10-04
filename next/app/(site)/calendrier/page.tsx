import { q } from "@/lib/db";

export const metadata = { title: "Calendrier" };

export default async function Calendar() {
  const rows = await q("select * from calendar order by date asc");
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="page"><div className="wrap">
      <p className="eyebrow">Calendrier</p>
      <h1 className="h1s">Les rendez-vous.</h1>
      <div className="list">
        {rows.map((e: any) => {
          const d = new Date(e.date);
          return (
            <div className={"card item hover" + (e.date < today ? " past" : "")} key={e.id}>
              <div className="cal-d"><b>{d.getUTCDate()}</b><span>{d.toLocaleDateString("fr-FR", { month: "short", year: "numeric", timeZone: "UTC" })}</span></div>
              <div><h3>{e.title}</h3><p>{e.place}</p></div>
            </div>
          );
        })}
      </div>
    </div></div>
  );
}
