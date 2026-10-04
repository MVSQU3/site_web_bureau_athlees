import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Pencil, Trash2, Check, Minus } from "lucide-react";
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
  const val = (v: any) => (v === true ? <Check size={16} className="text-success" /> : v === false ? <Minus size={16} className="opacity-40" /> : String(v ?? ""));
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3"><h1 className="text-3xl font-bold tracking-tight">{r.label}</h1><Link className="btn btn-primary btn-sm rounded-full" href={`/admin/${key}/new`}><Plus size={16} />Ajouter</Link></div>
      <div className="overflow-x-auto rounded-box bg-base-200">
        <table className="table">
          <thead><tr>{r.columns.map((c) => <th key={c}>{lab(c)}</th>)}<th /></tr></thead>
          <tbody>
            {rows.map((row: any) => (
              <tr key={row.id} className="hover:bg-base-300/50">
                {r.columns.map((c) => <td key={c}>{val(row[c])}</td>)}
                <td className="whitespace-nowrap text-right">
                  <Link className="btn btn-ghost btn-xs" href={`/admin/${key}/${row.id}`}><Pencil size={14} />Modifier</Link>
                  <form action={deleteResource.bind(null, key, row.id)} className="inline"><button className="btn btn-ghost btn-xs text-error"><Trash2 size={14} />Supprimer</button></form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={r.columns.length + 1} className="text-base-content/60">Rien pour le moment.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
