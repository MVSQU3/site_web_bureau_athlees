import { q } from "@/lib/db";
import { PageHead } from "@/components/ui";

export const metadata = { title: "Calendrier" };

export default async function Calendar() {
  const rows = await q("select * from calendar order by date asc");
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <PageHead eyebrow="Calendrier" title="Les rendez-vous." />
      <div className="space-y-4">
        {rows.map((e: any) => {
          const d = new Date(e.date);
          return (
            <div className={"card bg-base-200 transition hover:bg-base-300 " + (e.date < today ? "opacity-45" : "")} key={e.id}>
              <div className="card-body flex-row items-center gap-6">
                <div className="min-w-16 text-center"><div className="text-4xl font-bold leading-none">{d.getUTCDate()}</div><div className="text-xs font-semibold uppercase text-secondary">{d.toLocaleDateString("fr-FR", { month: "short", year: "numeric", timeZone: "UTC" })}</div></div>
                <div><h3 className="text-lg font-semibold">{e.title}</h3><p className="text-sm text-base-content/60">{e.place}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
