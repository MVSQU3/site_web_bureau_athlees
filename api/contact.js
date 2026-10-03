import { db } from "./_db.js";

const OBJETS = ["Demande d'adhésion", "Partenariat", "Presse", "Autre"];
const clean = (v, max) =>
  String(v ?? "")
    .trim()
    .slice(0, max);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Méthode non autorisée" });
  const b = req.body || {};
  if (b.site) return res.status(200).json({ ok: true }); // pot de miel anti-spam
  const nom = clean(b.nom, 120),
    email = clean(b.email, 200),
    message = clean(b.message, 5000);
  const objet = OBJETS.includes(b.objet) ? b.objet : "Autre";
  if (!nom || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Champs invalides" });
  try {
    const p = await db();
    await p.query(
      "insert into messages (nom, email, objet, message) values ($1, $2, $3, $4)",
      [nom, email, objet, message],
    );
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
