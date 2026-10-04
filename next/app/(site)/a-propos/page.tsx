import { q } from "@/lib/db";
import { settings, lines, initials } from "@/lib/util";

export const metadata = { title: "À propos" };

export default async function About() {
  const [s, bureau] = await Promise.all([settings(), q("select * from bureau order by position asc, id asc")]);
  return (
    <div className="page"><div className="wrap">
      <p className="eyebrow">À propos</p>
      <h1 className="h1s">Par les athlètes,<br />pour les athlètes.</h1>
      <p className="lead left">{s.about_lead}</p>
      <div className="grid3">{lines(s.values).map(([t, x]) => <div className="card" key={t}><h3>{t}</h3><p>{x}</p></div>)}</div>
      <h2 className="sec">Bureau exécutif</h2>
      <p className="lead left" style={{ marginTop: -12 }}>Bureau validé par la Direction Technique Nationale (DTN).</p>
      <div className="grid4">
        {bureau.map((m: any) => (
          <div className="card" key={m.id}>
            {m.photo ? <img className="photo" src={m.photo} alt={m.name} /> : <div className="avatar">{initials(m.name)}</div>}
            <h3>{m.name}</h3><p>{m.role}</p>
          </div>
        ))}
      </div>
    </div></div>
  );
}
