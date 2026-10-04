import Link from "next/link";
import { notFound } from "next/navigation";
import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { RESOURCES } from "@/lib/resources";
import { deleteResource } from "@/lib/actions";

export default async function List({ params }: { params: Promise<{ resource: string }> }) {
  await requireUser();
  const key = (await params).resource;
  const r = RESOURCES[key];
  if (!r) notFound();
  const rows = await q(`select * from ${r.table} order by ${r.order}`);
  const lab = (n: string) => r.fields.find((f) => f.name === n)?.label.replace(/ \(.*\)/, "") || n;
  const val = (v: any) => (v === true ? "✓" : v === false ? "—" : v ?? "");
  return (
    <>
      <div className="adm-bar"><h1>{r.label}</h1><span className="sp" /><Link className="abtn" href={`/admin/${key}/new`}>+ Ajouter</Link></div>
      <div className="acard" style={{ overflowX: "auto" }}>
        <table className="t">
          <thead><tr>{r.columns.map((c) => <th key={c}>{lab(c)}</th>)}<th /></tr></thead>
          <tbody>
            {rows.map((row: any) => (
              <tr key={row.id}>
                {r.columns.map((c) => <td key={c}>{String(val(row[c]))}</td>)}
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <Link className="abtn ghost sm" href={`/admin/${key}/${row.id}`}>Modifier</Link>{" "}
                  <form action={deleteResource.bind(null, key, row.id)} style={{ display: "inline" }}><button className="abtn danger sm">Supprimer</button></form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={r.columns.length + 1} className="meta">Rien pour le moment.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
