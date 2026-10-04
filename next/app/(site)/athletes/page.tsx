import { q } from "@/lib/db";
import AthleteList from "@/components/AthleteList";

export const metadata = { title: "Athlètes" };

export default async function Athletes() {
  const athletes = await q("select id, name, category, gender, rank, club, photo from athletes where published order by rank asc nulls last, name asc");
  return (
    <div className="page"><div className="wrap">
      <p className="eyebrow">Athlètes</p>
      <h1 className="h1s">Les joueuses et joueurs.</h1>
      <p className="lead left">Retrouvez les athlètes représentés par le Bureau, leur club et leur classement.</p>
      <AthleteList athletes={athletes} />
    </div></div>
  );
}
