import { currentUser } from "@/lib/auth";
import { q } from "@/lib/db";

const OK = ["image/jpeg", "image/png", "image/webp"];

// Téléversement d'une image publique depuis le back office (connecté uniquement, même origine)
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return Response.json({ error: "Origine refusée" }, { status: 403 });
  if (!(await currentUser())) return Response.json({ error: "Non connecté" }, { status: 401 });
  const file = (await req.formData()).get("file");
  if (!(file instanceof File) || !OK.includes(file.type) || file.size > 3 * 1024 * 1024) return Response.json({ error: "Image JPG, PNG ou WebP de 3 Mo maximum" }, { status: 400 });
  const rows = await q<{ id: number }>("insert into uploads (kind, mime, name, data) values ('public', $1, $2, $3) returning id", [file.type, file.name.slice(0, 200), Buffer.from(await file.arrayBuffer())]);
  return Response.json({ url: `/media/${rows[0].id}` });
}
