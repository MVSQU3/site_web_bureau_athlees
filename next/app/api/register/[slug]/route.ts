import { q, one, db } from "@/lib/db";
import { validate, FILE_MIMES, FILE_MAX, type Field } from "@/lib/forms";
import { today, iso } from "@/lib/util";

export const maxDuration = 30;

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fail = (error: string, status = 400) => Response.json({ error }, { status });
  const ev = await one<any>("select * from events where slug = $1 and published", [slug]);
  if (!ev) return fail("Événement introuvable", 404);
  if (!ev.registrations_open || (ev.deadline && today() > iso(ev.deadline))) return fail("Les inscriptions sont closes", 403);

  let fd: FormData;
  try { fd = await req.formData(); } catch { return fail("Requête invalide"); }
  if (fd.get("website")) return Response.json({ ok: true }); // pot de miel anti-spam
  let raw: Record<string, any> = {};
  try { raw = JSON.parse(String(fd.get("data") ?? "{}")); } catch { return fail("Requête invalide"); }

  const fields: Field[] = ev.form;
  const file = (k: string) => { const f = fd.get(`file__${k}`); return f instanceof File && f.size > 0 ? f : null; };
  const { data, errors, fileKeys } = validate(fields, raw, (k) => !!file(k));
  for (const k of fileKeys) {
    const f = file(k)!;
    if (!FILE_MIMES.includes(f.type) || f.size > FILE_MAX) errors.push(`${fields.find((x) => x.key === k)?.label} : image ou PDF de 3 Mo maximum`);
  }
  if (errors.length) return fail(errors[0]);

  // Doublon : mêmes valeurs sur les champs de déduplication de l'événement
  const dk: string[] = (ev.dedupe || []).filter((k: string) => data[k] !== undefined);
  if (dk.length) {
    const cond = dk.map((k, i) => `lower(data->>$${i + 2}) = lower($${dk.length + i + 2})`).join(" and ");
    const dup = await one(`select 1 from registrations where event_id = $1 and status <> 'annule' and ${cond}`, [ev.id, ...dk, ...dk.map((k) => String(data[k]))]);
    if (dup) return fail("Cette personne est déjà inscrite.", 409);
  }

  const pool = await db();
  const client = await pool.connect();
  try {
    await client.query("begin");
    // Verrou par événement : le calcul de la liste d'attente ne se chevauche pas
    await client.query("select pg_advisory_xact_lock($1)", [ev.id]);
    const n = (await client.query("select count(*)::int as n from registrations where event_id = $1 and status = 'inscrit'", [ev.id])).rows[0].n;
    const status = ev.capacity && n >= ev.capacity ? "liste_attente" : "inscrit";
    const reg = (await client.query("insert into registrations (event_id, data, status) values ($1, $2, $3) returning id", [ev.id, JSON.stringify(data), status])).rows[0];
    const files: Record<string, number> = {};
    for (const k of fileKeys) {
      const f = file(k)!;
      const up = await client.query("insert into uploads (kind, mime, name, data) values ('private', $1, $2, $3) returning id", [f.type, f.name.slice(0, 200), Buffer.from(await f.arrayBuffer())]);
      files[k] = up.rows[0].id;
    }
    if (fileKeys.length) await client.query("update registrations set files = $2 where id = $1", [reg.id, JSON.stringify(files)]);
    await client.query("commit");
    return Response.json({ ok: true, status, message: ev.confirmation });
  } catch (e) {
    await client.query("rollback").catch(() => {});
    console.error(e);
    return fail("Erreur serveur", 500);
  } finally {
    client.release();
  }
}
