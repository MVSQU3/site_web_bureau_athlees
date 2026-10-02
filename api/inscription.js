import { db } from "./_db.js";

// Mêmes choix que le formulaire (index.html, page Inscription)
const COMPETITIONS = ["BADMINTON", "PARABADMINTON", "AIRBADMINTON"];
const SIMPLES = ["Simple Homme", "Simple Femme"];
const DOUBLES = ["Double Homme", "Double Femme", "Double Mixte"];
const CATEGORIES = ["Seniors", "Juniors", "Cadets", "Benjamin"];
const LIMITE = new Date("2026-10-18T00:00:00Z"); // fin du 17 octobre (heure d'Abidjan = UTC)
const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const list = (v, ok) => [...new Set(Array.isArray(v) ? v : [])].filter((x) => ok.includes(x));

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });
  if (new Date() >= LIMITE) return res.status(403).json({ error: "Inscriptions closes" });
  const b = req.body || {};
  if (b.site) return res.status(200).json({ ok: true }); // pot de miel anti-spam
  const competitions = list(b.competitions, COMPETITIONS);
  const tableaux = [];
  if (competitions.includes("BADMINTON") && SIMPLES.includes(b.badminton)) tableaux.push(`Badminton – ${b.badminton}`);
  if (competitions.includes("PARABADMINTON") && SIMPLES.includes(b.parabadminton)) tableaux.push(`Para-badminton – ${b.parabadminton}`);
  if (competitions.includes("AIRBADMINTON")) list(b.airbadminton, DOUBLES).forEach((d) => tableaux.push(`AirBadminton – ${d}`));
  const sexe = clean(b.sexe, 60);
  const r = {
    nom: clean(b.nom, 160), naissance: clean(b.naissance, 10), telephone: clean(b.telephone, 30),
    sexe: ["HOMME", "FEMME"].includes(sexe) || /^Autre : \S/.test(sexe) ? sexe : "",
    club: clean(b.club, 160), licencie: b.licencie === "oui" ? true : b.licencie === "non" ? false : null,
    categorie: CATEGORIES.includes(b.categorie) ? b.categorie : "",
    partenaire: competitions.includes("AIRBADMINTON") ? clean(b.partenaire, 160) : "",
  };
  // Chaque compétition cochée doit avoir au moins un tableau choisi
  const parComp = { BADMINTON: "Badminton –", PARABADMINTON: "Para-badminton –", AIRBADMINTON: "AirBadminton –" };
  const complet = competitions.length && competitions.every((c) => tableaux.some((t) => t.startsWith(parComp[c])));
  if (!r.nom || !r.sexe || !r.club || r.licencie === null || !r.categorie || !complet || !/^\d{4}-\d{2}-\d{2}$/.test(r.naissance))
    return res.status(400).json({ error: "Champs invalides" });
  try {
    const p = await db();
    const dup = await p.query("select 1 from inscriptions where lower(nom) = lower($1) and naissance = $2", [r.nom, r.naissance]);
    if (dup.rowCount) return res.status(409).json({ error: "Déjà inscrit(e)" });
    await p.query(
      `insert into inscriptions (nom, naissance, sexe, club, licencie, competitions, tableaux, partenaire, categorie, telephone)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [r.nom, r.naissance, r.sexe, r.club, r.licencie, competitions, tableaux, r.partenaire, r.categorie, r.telephone]);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
