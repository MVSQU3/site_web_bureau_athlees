import { db } from "./_db.js";

const CATEGORIES = ["Double Hommes", "Double Mixte"];
const PAIEMENTS = ["Espèces", "Mobile Money (Wave)"];
const LIMITE = new Date("2026-10-18T00:00:00Z"); // fin du 17 octobre (heure d'Abidjan = UTC)
const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const date = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });
  if (new Date() >= LIMITE) return res.status(403).json({ error: "Inscriptions closes" });
  const b = req.body || {};
  if (b.site) return res.status(200).json({ ok: true }); // pot de miel anti-spam
  const r = {
    categorie: CATEGORIES.includes(b.categorie) ? b.categorie : "",
    j1_nom: clean(b.j1_nom, 160), j1_naissance: date(clean(b.j1_naissance, 10)), j1_tel: clean(b.j1_tel, 30), j1_club: clean(b.j1_club, 160),
    j2_nom: clean(b.j2_nom, 160), j2_naissance: date(clean(b.j2_naissance, 10)), j2_tel: clean(b.j2_tel, 30), j2_club: clean(b.j2_club, 160),
    paire: clean(b.paire, 120),
    paiement: PAIEMENTS.includes(b.paiement) ? b.paiement : "",
    preuve: typeof b.preuve === "string" && /^data:(image\/jpeg|image\/png|application\/pdf);base64,[A-Za-z0-9+/=]+$/.test(b.preuve) && b.preuve.length <= 3_500_000 ? b.preuve : null,
  };
  const manque = ["categorie", "j1_nom", "j1_naissance", "j1_tel", "j1_club", "j2_nom", "j2_naissance", "j2_tel", "j2_club", "paiement"].some((k) => !r[k]);
  if (manque || b.accepte !== true) return res.status(400).json({ error: "Champs invalides" });
  if (r.paiement.startsWith("Mobile Money") && !r.preuve) return res.status(400).json({ error: "Preuve de paiement manquante" });
  try {
    const p = await db();
    const dup = await p.query("select 1 from open_inscriptions where lower(j1_nom) = lower($1) and j1_naissance = $2", [r.j1_nom, r.j1_naissance]);
    if (dup.rowCount) return res.status(409).json({ error: "Déjà inscrit(e)" });
    await p.query(
      `insert into open_inscriptions (categorie, j1_nom, j1_naissance, j1_tel, j1_club, j2_nom, j2_naissance, j2_tel, j2_club, paire, paiement, preuve)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [r.categorie, r.j1_nom, r.j1_naissance, r.j1_tel, r.j1_club, r.j2_nom, r.j2_naissance, r.j2_tel, r.j2_club, r.paire, r.paiement, r.preuve]);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
