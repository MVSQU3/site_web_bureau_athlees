import { db } from "./_db.js";

// Doit correspondre au programme de assets/data.js
const TABLEAUX = [
  "AirBadminton – Double Hommes", "AirBadminton – Double Dames", "AirBadminton – Double Mixte",
  "Badminton classique – Simple Hommes", "Badminton classique – Simple Dames",
  "Para-Badminton – Simple Hommes", "Para-Badminton – Simple Dames",
];
const LIMITE = new Date("2026-10-18T00:00:00Z"); // fin du 17 octobre (heure d'Abidjan = UTC)
const clean = (v, max) => String(v ?? "").trim().slice(0, max);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });
  if (new Date() >= LIMITE) return res.status(403).json({ error: "Inscriptions closes" });
  const b = req.body || {};
  if (b.site) return res.status(200).json({ ok: true }); // pot de miel anti-spam
  const r = {
    nom: clean(b.nom, 80), prenom: clean(b.prenom, 120), sexe: b.sexe === "F" ? "F" : b.sexe === "H" ? "H" : "",
    naissance: clean(b.naissance, 10), telephone: clean(b.telephone, 30), email: clean(b.email, 200),
    club: clean(b.club, 120), partenaire: clean(b.partenaire, 160),
    tableaux: [...new Set(Array.isArray(b.tableaux) ? b.tableaux : [])].filter((t) => TABLEAUX.includes(t)),
  };
  if (!r.nom || !r.prenom || !r.sexe || !r.telephone || !r.club || !r.tableaux.length
    || !/^\d{4}-\d{2}-\d{2}$/.test(r.naissance) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email))
    return res.status(400).json({ error: "Champs invalides" });
  try {
    const p = await db();
    const dup = await p.query("select 1 from inscriptions where lower(email) = lower($1) and lower(nom) = lower($2) and lower(prenom) = lower($3)", [r.email, r.nom, r.prenom]);
    if (dup.rowCount) return res.status(409).json({ error: "Déjà inscrit(e) avec cet e-mail" });
    await p.query(
      "insert into inscriptions (nom, prenom, sexe, naissance, telephone, email, club, tableaux, partenaire) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
      [r.nom, r.prenom, r.sexe, r.naissance, r.telephone, r.email, r.club, r.tableaux, r.partenaire]);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
