import { currentUser } from "@/lib/auth";
import { one } from "@/lib/db";

// Pièces jointes des inscriptions (preuves de paiement…) : administrateurs uniquement
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return new Response("Non autorisé", { status: 401 });
  const { id } = await params;
  const f = await one<{ mime: string; data: Buffer; name: string }>("select mime, data, name from uploads where id = $1", [Number(id) || 0]);
  if (!f) return new Response("Introuvable", { status: 404 });
  return new Response(new Uint8Array(f.data), { headers: { "Content-Type": f.mime, "Content-Disposition": "inline", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
