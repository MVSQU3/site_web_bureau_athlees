import Link from "next/link";
import { notFound } from "next/navigation";
import { Save } from "lucide-react";
import { one } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { RESOURCES } from "@/lib/resources";
import { saveResource } from "@/lib/actions";
import ImageField from "@/components/ImageField";
import { Field } from "@/components/ui";

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
      <h1 className="mb-6 text-3xl font-bold tracking-tight">{isNew ? `Nouvelle ${r.singular}` : `Modifier : ${r.singular}`}</h1>
      <form action={saveResource.bind(null, key, isNew ? null : row.id)} className="card max-w-2xl bg-base-200">
        <div className="card-body gap-4">
          {r.fields.map((f) => {
            if (f.type === "image") return <ImageField key={f.name} name={f.name} label={f.label} value={row[f.name]} />;
            if (f.type === "checkbox") return <label key={f.name} className="label cursor-pointer justify-start gap-3 text-base text-base-content"><input type="checkbox" className="toggle toggle-primary" name={f.name} defaultChecked={!!row[f.name]} />{f.label}</label>;
            return (
              <Field key={f.name} label={f.label} required={f.required}>
                {f.type === "textarea" ? <textarea className="textarea h-40 w-full text-base" name={f.name} defaultValue={row[f.name] ?? ""} />
                  : f.type === "select" ? <select className="select w-full text-base" name={f.name} defaultValue={row[f.name]}>{f.options!.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                  : <input className="input w-full text-base" name={f.name} type={f.type} required={f.required} defaultValue={row[f.name] ?? ""} />}
              </Field>
            );
          })}
          <div className="flex gap-3"><button className="btn btn-primary rounded-full"><Save size={16} />Enregistrer</button><Link className="btn btn-ghost rounded-full" href={`/admin/${key}`}>Annuler</Link></div>
        </div>
      </form>
    </>
  );
}
