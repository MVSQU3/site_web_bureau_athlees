import { currentUser } from "@/lib/auth";
import { q, one } from "@/lib/db";
import { fmtDateTime } from "@/lib/util";
import type { Field } from "@/lib/forms";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return new Response("Non autorisé", { status: 401 });
  const { id } = await params;
  const ev = await one<any>("select * from events where id = $1", [Number(id) || 0]);
  if (!ev) return new Response("Introuvable", { status: 404 });
  const rows = await q<any>("select * from registrations where event_id = $1 order by created_at asc", [ev.id]);
  const fields: Field[] = (ev.form as Field[]).filter((f) => f.type !== "section");
  const cell = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["N°", "Date d'inscription", "Statut", "Paiement confirmé", ...fields.map((f) => f.label.slice(0, 80))];
  const lines = rows.map((r, i) => [i + 1, fmtDateTime(r.created_at), r.status, r.paid ? "oui" : "non", ...fields.map((f) => {
    const v = r.data[f.key];
    return f.type === "file" ? (r.files?.[f.key] ? "joint" : "") : Array.isArray(v) ? v.join(" | ") : v === true ? "oui" : v;
  })].map(cell).join(";"));
  const csv = "﻿" + [head.map(cell).join(";"), ...lines].join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${ev.slug}.csv"`, "Cache-Control": "private, no-store" } });
}
