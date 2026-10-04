import { q } from "@/lib/db";
import AthleteList from "@/components/AthleteList";
import { PageHead } from "@/components/ui";

export const metadata = { title: "Athlètes" };

export default async function Athletes() {
  const athletes = await q("select id, name, category, gender, rank, club, photo from athletes where published order by rank asc nulls last, name asc");
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <PageHead eyebrow="Athlètes" title="Les joueuses et joueurs." lead="Retrouvez les athlètes représentés par le Bureau, leur club et leur classement." />
      <AthleteList athletes={athletes} />
    </div>
  );
}
