import { db } from "./_db.js";
import { timingSafeEqual } from "node:crypto";

// Lecture réservée à l'admin : en-tête Authorization: Bearer <ADMIN_PASSWORD>
const ok = (given) => {
  const want = process.env.ADMIN_PASSWORD || "";
  const a = Buffer.from(String(given)),
    b = Buffer.from(want);
  return want.length >= 8 && a.length === b.length && timingSafeEqual(a, b);
};

export default async function handler(req, res) {
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  if (!ok(token)) return res.status(401).json({ error: "Non autorisé" });
  try {
    const p = await db();
    const table =
      req.query.type === "inscriptions" ? "inscriptions" : "messages";
    if (req.method === "DELETE") {
      await p.query(`delete from ${table} where id = $1`, [
        Number(req.query.id),
      ]);
      return res.status(200).json({ ok: true });
    }
    const { rows } = await p.query(
      `select * from ${table} order by created_at desc limit 2000`,
    );
    res.status(200).json({ [table]: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
