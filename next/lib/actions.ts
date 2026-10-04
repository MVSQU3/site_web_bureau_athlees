"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { q, one } from "./db";
import { login, logout, requireUser } from "./auth";
import { RESOURCES } from "./resources";
import { TYPE_LABELS, slugify, type Field } from "./forms";

const str = (f: FormData, k: string, max = 5000) =>
  String(f.get(k) ?? "")
    .trim()
    .slice(0, max);

/* ---------- Connexion ---------- */
export async function loginAction(_: any, f: FormData) {
  const email = str(f, "email", 200);
  const ok = await login(email, String(f.get("password") ?? ""));
  if (!ok)
    return {
      error:
        "E-mail ou mot de passe incorrect (ou trop de tentatives, réessaie dans 10 minutes).",
      email,
    };
  redirect("/admin");
}
export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

/* ---------- Ressources simples (actualités, calendrier, athlètes, bureau) ---------- */
export async function saveResource(
  key: string,
  id: number | null,
  f: FormData,
) {
  await requireUser();
  const r = RESOURCES[key];
  if (!r) throw new Error("Ressource inconnue");
  const vals: any[] = [];
  for (const fd of r.fields) {
    const raw = f.get(fd.name);
    if (fd.type === "checkbox") vals.push(raw === "on");
    else if (fd.type === "number")
      vals.push(raw === null || raw === "" ? null : Number(raw));
    else if (fd.type === "image") vals.push(String(raw ?? "").trim() || null);
    else vals.push(String(raw ?? "").trim());
  }
  const names = r.fields.map((x) => x.name);
  if (id) {
    await q(
      `update ${r.table} set ${names.map((n, i) => `${n} = $${i + 1}`).join(", ")} where id = $${names.length + 1}`,
      [...vals, id],
    );
  } else {
    await q(
      `insert into ${r.table} (${names.join(", ")}) values (${names.map((_, i) => `$${i + 1}`).join(", ")})`,
      vals,
    );
  }
  redirect(`/admin/${key}`);
}
export async function deleteResource(key: string, id: number) {
  await requireUser();
  const r = RESOURCES[key];
  if (!r) throw new Error("Ressource inconnue");
  await q(`delete from ${r.table} where id = $1`, [id]);
  revalidatePath(`/admin/${key}`);
}

/* ---------- Événements ---------- */
const TYPES = Object.keys(TYPE_LABELS);
function cleanForm(raw: string): Field[] {
  let arr: any[] = [];
  try {
    arr = JSON.parse(raw);
  } catch {
    return [];
  }
  const seen = new Set<string>();
  return (Array.isArray(arr) ? arr : []).slice(0, 120).flatMap((f) => {
    if (!f || !TYPES.includes(f.type) || !String(f.label ?? "").trim())
      return [];
    let key = slugify(f.key || f.label),
      n = 2;
    while (seen.has(key)) key = `${slugify(f.key || f.label)}_${n++}`;
    seen.add(key);
    const o: Field = {
      key,
      label: String(f.label).trim().slice(0, 400),
      type: f.type,
    };
    if (f.required) o.required = true;
    if (["radio", "checkbox", "select"].includes(f.type)) {
      o.options = (Array.isArray(f.options) ? f.options : [])
        .map((x: any) => String(x).trim())
        .filter(Boolean)
        .slice(0, 40);
      if (f.other && f.type !== "select") o.other = true;
    }
    if (f.help) o.help = String(f.help).trim().slice(0, 500);
    if (f.showIf?.key && Array.isArray(f.showIf.in) && f.showIf.in.length)
      o.showIf = { key: String(f.showIf.key), in: f.showIf.in.map(String) };
    return [o];
  });
}

export async function saveEvent(id: number | null, f: FormData) {
  await requireUser();
  const title = str(f, "title", 200);
  if (!title) throw new Error("Titre obligatoire");
  let slug = slugify(str(f, "slug", 80) || title).replace(/_/g, "-");
  const dup = await one(
    "select id from events where slug = $1 and id is distinct from $2",
    [slug, id],
  );
  if (dup) slug += "-" + Date.now().toString(36).slice(-4);
  const extra = str(f, "extra")
    .split("\n")
    .map((l) => l.split("|").map((x) => x.trim()))
    .filter((p) => p[0] && p[1])
    .map((p) => [p[0], p[1]]);
  const programme = str(f, "programme")
    .split("\n")
    .map((l) => l.split("|").map((x) => x.trim()))
    .filter((p) => p[0])
    .map((p) => ({
      jour: p[0],
      discipline: p[1] || "",
      tableaux: (p[2] || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    }));
  const form = cleanForm(str(f, "form", 200000));
  const dedupe = str(f, "dedupe")
    .split(",")
    .map((x) => x.trim())
    .filter((k) => form.some((x) => x.key === k));
  const cap = str(f, "capacity");
  const vals = [
    slug,
    title,
    str(f, "hook"),
    str(f, "poster", 500) || null,
    str(f, "dates_label", 200),
    str(f, "place", 200),
    str(f, "start_date", 10),
    str(f, "deadline", 10) || null,
    str(f, "price_label", 200),
    str(f, "infoline", 50),
    JSON.stringify(extra),
    JSON.stringify(programme),
    cap ? Number(cap) : null,
    f.get("registrations_open") === "on",
    f.get("published") === "on",
    JSON.stringify(form),
    JSON.stringify(dedupe),
    str(f, "confirmation", 1000),
  ];
  const cols = [
    "slug",
    "title",
    "hook",
    "poster",
    "dates_label",
    "place",
    "start_date",
    "deadline",
    "price_label",
    "infoline",
    "extra",
    "programme",
    "capacity",
    "registrations_open",
    "published",
    "form",
    "dedupe",
    "confirmation",
  ];
  if (id)
    await q(
      `update events set ${cols.map((c, i) => `${c} = $${i + 1}`).join(", ")} where id = $${cols.length + 1}`,
      [...vals, id],
    );
  else
    await q(
      `insert into events (${cols.join(", ")}) values (${cols.map((_, i) => `$${i + 1}`).join(", ")})`,
      vals,
    );
  redirect("/admin/events");
}
export async function deleteEvent(id: number) {
  await requireUser("admin");
  await q("delete from events where id = $1", [id]);
  redirect("/admin/events");
}

/* ---------- Inscriptions ---------- */
export async function setRegistration(
  id: number,
  patch: { paid?: boolean; status?: string },
) {
  await requireUser("admin");
  if (patch.paid !== undefined)
    await q("update registrations set paid = $2 where id = $1", [
      id,
      patch.paid,
    ]);
  if (
    patch.status &&
    ["inscrit", "liste_attente", "annule"].includes(patch.status)
  )
    await q("update registrations set status = $2 where id = $1", [
      id,
      patch.status,
    ]);
  revalidatePath("/admin/registrations/[id]", "page");
}
export async function deleteRegistration(id: number) {
  await requireUser("admin");
  await q(
    "delete from uploads where id in (select (value)::int from registrations, jsonb_each_text(files) where registrations.id = $1)",
    [id],
  );
  await q("delete from registrations where id = $1", [id]);
  revalidatePath("/admin/registrations/[id]", "page");
}

/* ---------- Messages ---------- */
export async function submitContact(_: any, f: FormData) {
  if (str(f, "website"))
    return { ok: "Merci ! Votre message a bien été envoyé." };
  const name = str(f, "name", 120),
    email = str(f, "email", 200),
    subject = str(f, "subject", 120),
    body = str(f, "body", 5000);
  if (!name || !body || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "Merci de remplir tous les champs avec un e-mail valide." };
  await q(
    "insert into messages (name, email, subject, body) values ($1,$2,$3,$4)",
    [name, email, subject || "Autre", body],
  );
  return { ok: "Merci ! Votre message a bien été envoyé." };
}
export async function setMessageHandled(id: number, handled: boolean) {
  await requireUser("admin");
  await q("update messages set handled = $2 where id = $1", [id, handled]);
  revalidatePath("/admin/messages");
}
export async function deleteMessage(id: number) {
  await requireUser("admin");
  await q("delete from messages where id = $1", [id]);
  revalidatePath("/admin/messages");
}

/* ---------- Réglages & utilisateurs ---------- */
export async function saveSettings(f: FormData) {
  await requireUser("admin");
  for (const k of [
    "site_name",
    "tagline",
    "email",
    "phone",
    "address",
    "hero_lead",
    "about_lead",
    "stats",
    "values",
  ]) {
    await q(
      "insert into settings (key, value) values ($1, $2) on conflict (key) do update set value = excluded.value",
      [k, str(f, k)],
    );
  }
  redirect("/admin/settings");
}
export async function createUser(_: any, f: FormData) {
  await requireUser("admin");
  const email = str(f, "email", 200).toLowerCase(),
    pw = String(f.get("password") ?? ""),
    role = f.get("role") === "admin" ? "admin" : "editor";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || pw.length < 8)
    return {
      error:
        "E-mail invalide ou mot de passe trop court (8 caractères minimum).",
    };
  if (await one("select 1 from users where email = $1", [email]))
    return { error: "Cet e-mail a déjà un compte." };
  await q(
    "insert into users (email, name, password_hash, role) values ($1,$2,$3,$4)",
    [email, str(f, "name", 120), await bcrypt.hash(pw, 10), role],
  );
  revalidatePath("/admin/users");
  return { ok: `Compte créé pour ${email}.` };
}
export async function deleteUser(id: number) {
  const me = await requireUser("admin");
  if (me.id === id) return;
  await q("delete from users where id = $1", [id]);
  revalidatePath("/admin/users");
}
export async function resetPassword(id: number, f: FormData) {
  await requireUser("admin");
  const pw = String(f.get("password") ?? "");
  if (pw.length < 8) return;
  await q("update users set password_hash = $2 where id = $1", [
    id,
    await bcrypt.hash(pw, 10),
  ]);
  revalidatePath("/admin/users");
}
