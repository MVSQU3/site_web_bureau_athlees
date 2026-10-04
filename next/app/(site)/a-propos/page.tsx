import { q } from "@/lib/db";
import { settings, lines, initials } from "@/lib/util";
import { PageHead, SectionTitle } from "@/components/ui";

export const metadata = { title: "À propos" };

export default async function About() {
  const [s, bureau] = await Promise.all([settings(), q("select * from bureau order by position asc, id asc")]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <PageHead eyebrow="À propos" title={<>Par les athlètes,<br />pour les athlètes.</>} lead={s.about_lead} />
      <div className="grid gap-5 md:grid-cols-3">
        {lines(s.values).map(([t, x]) => <div className="card bg-base-200" key={t}><div className="card-body"><h3 className="card-title">{t}</h3><p className="text-sm text-base-content/60">{x}</p></div></div>)}
      </div>
      <SectionTitle>Bureau exécutif</SectionTitle>
      <p className="-mt-4 mb-6 text-base-content/60">Bureau validé par la Direction Technique Nationale (DTN).</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {bureau.map((m: any) => (
          <div className="card bg-base-200" key={m.id}>
            <div className="card-body">
              {m.photo
                ? <img className="mb-2 size-[72px] rounded-full border border-base-300 object-cover" src={m.photo} alt={m.name} />
                : <div className="avatar avatar-placeholder mb-2"><div className="w-[72px] rounded-full border border-base-300 bg-neutral text-2xl text-neutral-content">{initials(m.name)}</div></div>}
              <h3 className="card-title text-lg">{m.name}</h3><p className="text-sm text-base-content/60">{m.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
