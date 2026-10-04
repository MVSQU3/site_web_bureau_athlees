import { db } from "./_db.js";

const CAMP_DEBUT = new Date("2026-10-27T00:00:00Z");
const LIENS = ["Père", "Mère", "Tuteur légal"];
const PRATIQUES = ["Non, je suis débutant(e)", "Oui, occasionnellement", "Oui, régulièrement", "Joueur/Joueuse confirmé(e)"];
const DUREES = ["Moins de 1 an", "1 à 2 ans", "3 à 5 ans", "Plus de 5 ans"];
const OBJECTIFS = ["Découvrir le badminton", "Apprendre les bases techniques", "Améliorer mon niveau", "Préparer des compétitions", "Améliorer ma condition physique", "Me perfectionner techniquement et tactiquement"];
const clean = (v, max = 200) => String(v ?? "").trim().slice(0, max);
const autre = (v) => /^Autre : \S/.test(v);
const ouiDetail = (v) => v === "Non" || /^Oui : \S/.test(v);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });
  const b = req.body || {};
  if (b.site) return res.status(200).json({ ok: true }); // pot de miel anti-spam
  const t = (k, max) => clean(b[k], max);
  const naissance = t("naissance", 10);
  const nais = /^\d{4}-\d{2}-\d{2}$/.test(naissance) ? new Date(naissance + "T00:00:00Z") : null;
  if (!nais || isNaN(nais)) return res.status(400).json({ error: "Date de naissance invalide" });
  const age = Math.floor((CAMP_DEBUT - nais) / (365.25 * 864e5));
  if (age < 7 || age > 100) return res.status(400).json({ error: "Camp ouvert à partir de 7 ans" });
  const mineur = age < 18;

  const o = {
    telephone: t("telephone", 30), adresse: t("adresse", 200),
    parent_nom: t("parent_nom", 160), parent_lien: t("parent_lien", 60), parent_tel: t("parent_tel", 30), parent_whatsapp: t("parent_whatsapp", 30), parent_adresse: t("parent_adresse", 200),
    pratique: t("pratique", 60), duree: t("duree", 30), club: t("club", 160),
    objectifs: (Array.isArray(b.objectifs) ? b.objectifs : []).map((x) => clean(x, 120)).filter((x) => OBJECTIFS.includes(x) || autre(x)),
    competition: t("competition", 3), competition_niveau: t("competition_niveau", 160), main: t("main", 10), categorie: t("categorie", 120),
    medical: t("medical", 300), allergies: t("allergies", 300), traitement: t("traitement", 300),
    urgence_nom: t("urgence_nom", 160), urgence_lien: t("urgence_lien", 80), urgence_tel: t("urgence_tel", 30), urgence_tel2: t("urgence_tel2", 30),
    autorisation: mineur ? t("autorisation", 20) : "", image: t("image", 3),
  };
  if (!mineur) Object.assign(o, { parent_nom: "", parent_lien: "", parent_tel: "", parent_whatsapp: "", parent_adresse: "" });
  const nom = t("nom", 80), prenoms = t("prenoms", 120), sexe = t("sexe", 20);
  const ok =
    nom && prenoms && ["Masculin", "Féminin"].includes(sexe) && o.adresse &&
    (!mineur || (o.parent_nom && (LIENS.includes(o.parent_lien) || autre(o.parent_lien)) && o.parent_tel && o.parent_adresse && o.autorisation === "J'accepte")) &&
    PRATIQUES.includes(o.pratique) && (o.pratique === PRATIQUES[0] ? ((o.duree = ""), true) : DUREES.includes(o.duree)) &&
    o.objectifs.length && ["Oui", "Non"].includes(o.competition) && ["Droite", "Gauche"].includes(o.main) &&
    ouiDetail(o.medical) && ouiDetail(o.allergies) && ouiDetail(o.traitement) &&
    o.urgence_nom && o.urgence_lien && o.urgence_tel && ["Oui", "Non"].includes(o.image) && b.engagement === true;
  if (!ok) return res.status(400).json({ error: "Champs invalides" });
  if (o.competition === "Non") o.competition_niveau = "";

  try {
    const p = await db();
    const dup = await p.query("select 1 from camp_inscriptions where lower(nom) = lower($1) and lower(prenoms) = lower($2) and naissance = $3", [nom, prenoms, naissance]);
    if (dup.rowCount) return res.status(409).json({ error: "Déjà inscrit(e)" });
    await p.query("insert into camp_inscriptions (nom, prenoms, naissance, sexe, mineur, donnees) values ($1,$2,$3,$4,$5,$6)", [nom, prenoms, naissance, sexe, mineur, JSON.stringify(o)]);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
