import { one } from "@/lib/db";

// Images publiques uniquement (affiches, photos). Les pièces jointes des inscriptions ne passent jamais ici.
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = await one<{ mime: string; data: Buffer }>("select mime, data from uploads where id = $1 and kind = 'public'", [Number(id) || 0]);
  if (!f) return new Response("Introuvable", { status: 404 });
  return new Response(new Uint8Array(f.data), { headers: { "Content-Type": f.mime, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
}
