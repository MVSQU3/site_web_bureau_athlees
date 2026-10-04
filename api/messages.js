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
      {
        inscriptions: "inscriptions",
        open: "open_inscriptions",
        camp: "camp_inscriptions",
      }[
        req.query.type
      ] || "messages";
    const id = Number(req.query.id);
    if (table === "open_inscriptions" && req.method === "PATCH") {
      await p.query("update open_inscriptions set paye = $2 where id = $1", [
        id,
        req.query.paye === "1",
      ]);
      return res.status(200).json({ ok: true });
    }
    if (table === "open_inscriptions" && req.query.preuve) {
      const r = await p.query(
        "select preuve from open_inscriptions where id = $1",
        [id],
      );
      return res.status(200).json({ preuve: r.rows[0]?.preuve || null });
    }
    if (req.method === "DELETE") {
      await p.query(`delete from ${table} where id = $1`, [id]);
      return res.status(200).json({ ok: true });
    }
    // La preuve de paiement (lourde) est chargée à part, à la demande
    const cols =
      table === "open_inscriptions"
        ? "id, created_at, categorie, j1_nom, j1_naissance, j1_tel, j1_club, j2_nom, j2_naissance, j2_tel, j2_club, paire, paiement, paye, (preuve is not null) as has_preuve"
        : "*";
    const { rows } = await p.query(
      `select ${cols} from ${table} order by created_at desc limit 2000`,
    );
    res.status(200).json({ [table]: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
