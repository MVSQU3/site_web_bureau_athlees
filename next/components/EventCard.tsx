import Link from "next/link";
import { CalendarDays, MapPin, Wallet, Clock, Phone, ArrowRight, ArrowDown, Info } from "lucide-react";
import { eventStatus, fmtDate, telHref } from "@/lib/util";

const Fact = ({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) => (
  <li className="flex gap-3"><Icon size={18} className="mt-0.5 shrink-0 text-secondary" /><div><div className="text-xs uppercase tracking-wide text-base-content/50">{label}</div><div>{children}</div></div></li>
);

export default function EventCard({ e, detail = false }: { e: any; detail?: boolean }) {
  const open = eventStatus(e) === "open";
  return (
    <article className="grid gap-8 rounded-3xl border border-base-300 bg-base-200 p-5 sm:p-6 md:grid-cols-5">
      {e.poster && <a className="md:col-span-2" href={e.poster} target="_blank" rel="noopener"><img className="w-full rounded-2xl" src={e.poster} alt={`Affiche : ${e.title}`} loading="lazy" /></a>}
      <div className={e.poster ? "md:col-span-3" : "md:col-span-5"}>
        <p className="mb-1 font-semibold text-secondary">Événement</p>
        <h2 className="mb-3 text-3xl font-bold tracking-tight">{detail ? e.title : <Link href={`/evenements/${e.slug}`} className="hover:underline">{e.title}</Link>}</h2>
        {e.hook && <p className="text-base-content/80">{e.hook}</p>}
        <ul className="my-6 grid gap-4 sm:grid-cols-2">
          <Fact icon={CalendarDays} label="Dates">{e.dates_label}</Fact>
          <Fact icon={MapPin} label="Lieu">{e.place}</Fact>
          {(e.extra || []).map(([k, v]: string[]) => <Fact key={k} icon={Info} label={k}>{v}</Fact>)}
          {e.price_label && <Fact icon={Wallet} label="Participation">{e.price_label}</Fact>}
          {e.deadline && <Fact icon={Clock} label="Inscriptions">jusqu&apos;au {fmtDate(e.deadline)}</Fact>}
          {e.infoline && <Fact icon={Phone} label="Infoline"><a className="link" href={telHref(e.infoline)}>{e.infoline}</a></Fact>}
        </ul>
        {(e.programme || []).length > 0 && (
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            {e.programme.map((p: any, i: number) => (
              <div key={i} className="rounded-xl border border-base-300 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-secondary">{p.jour}</div>
                <h3 className="my-1 font-semibold">{p.discipline}</h3>
                <p className="text-sm text-base-content/60">{(p.tableaux || []).join(" · ")}</p>
              </div>
            ))}
          </div>
        )}
        {open
          ? <Link className="btn btn-primary rounded-full" href={`/evenements/${e.slug}${detail ? "#inscription" : ""}`}>{detail ? <>S&apos;inscrire <ArrowDown size={18} /></> : <>S&apos;inscrire <ArrowRight size={18} /></>}</Link>
          : <span className="badge badge-outline">Inscriptions closes</span>}
      </div>
    </article>
  );
}
