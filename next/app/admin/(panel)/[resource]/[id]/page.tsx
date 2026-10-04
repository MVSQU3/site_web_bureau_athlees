import Link from "next/link";
import { notFound } from "next/navigation";
import { one } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { RESOURCES } from "@/lib/resources";
import { saveResource } from "@/lib/actions";
import ImageField from "@/components/ImageField";

export default async function Edit({ params }: { params: Promise<{ resource: string; id: string }> }) {
  await requireUser();
  const { resource: key, id } = await params;
  const r = RESOURCES[key];
  if (!r) notFound();
  const isNew = id === "new";
  const row: any = isNew ? { date: new Date().toISOString().slice(0, 10), published: true, position: 0, gender: "H" } : await one(`select * from ${r.table} where id = $1`, [Number(id) || 0]);
  if (!row) notFound();
  return (
    <>
      <div className="adm-bar"><h1>{isNew ? `Nouvelle ${r.singular}` : `Modifier : ${r.singular}`}</h1></div>
      <form action={saveResource.bind(null, key, isNew ? null : row.id)} className="acard" style={{ maxWidth: 640 }}>
        {r.fields.map((f) => {
          if (f.type === "image") return <ImageField key={f.name} name={f.name} label={f.label} value={row[f.name]} />;
          if (f.type === "checkbox") return <label key={f.name} className="afield" style={{ flexDirection: "row", alignItems: "center" }}><input type="checkbox" name={f.name} defaultChecked={!!row[f.name]} style={{ width: 18 }} /> {f.label}</label>;
          return (
            <label key={f.name} className="afield">{f.label}{f.required && " *"}
              {f.type === "textarea" ? <textarea name={f.name} rows={6} defaultValue={row[f.name] ?? ""} />
                : f.type === "select" ? <select name={f.name} defaultValue={row[f.name]}>{f.options!.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                : <input name={f.name} type={f.type} required={f.required} defaultValue={row[f.name] ?? ""} />}
            </label>
          );
        })}
        <div className="adm-bar" style={{ marginBottom: 0 }}><button className="abtn">Enregistrer</button><Link className="abtn ghost" href={`/admin/${key}`}>Annuler</Link></div>
      </form>
    </>
  );
}
