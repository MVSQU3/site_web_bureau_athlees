import type pg from "pg";
import type { Field } from "./forms";

const text = (key: string, label: string, o: Partial<Field> = {}): Field => ({ key, label, type: "text", ...o });
const radio = (key: string, label: string, options: string[], o: Partial<Field> = {}): Field => ({ key, label, type: "radio", options, required: true, ...o });
const check = (key: string, label: string, options: string[], o: Partial<Field> = {}): Field => ({ key, label, type: "checkbox", options, ...o });
const section = (key: string, label: string, o: Partial<Field> = {}): Field => ({ key, label, type: "section", ...o });
const if_ = (key: string, ...v: string[]) => ({ key, in: v });
const OUINON = ["Oui", "Non"];

const championnat: Field[] = [
  text("nom", "Nom et prénoms", { required: true }),
  { key: "naissance", label: "Date de naissance", type: "date", required: true },
  { key: "telephone", label: "Téléphone (facultatif)", type: "tel" },
  radio("sexe", "Sexe", ["HOMME", "FEMME"], { other: true }),
  text("club", "Club et ville d'origine", { required: true }),
  radio("licencie", "Licencié", ["oui", "non"]),
  check("competitions", "Compétitions", ["BADMINTON", "PARABADMINTON", "AIRBADMINTON"], { required: true }),
  radio("badminton", "BADMINTON", ["Simple Homme", "Simple Femme"], { showIf: if_("competitions", "BADMINTON") }),
  radio("parabadminton", "PARABADMINTON", ["Simple Femme", "Simple Homme"], { showIf: if_("competitions", "PARABADMINTON") }),
  check("airbadminton", "AIRBADMINTON", ["Double Homme", "Double Femme", "Double Mixte"], { required: true, showIf: if_("competitions", "AIRBADMINTON") }),
  text("partenaire", "Le nom de ton coéquipier", { help: "AIRBADMINTON : nom du coéquipier en double et mixte", showIf: if_("competitions", "AIRBADMINTON") }),
  radio("categorie", "Catégorie", ["Seniors : + 19 ans", "Juniors : 16 à 19 ans", "Cadets : 14 à 16 ans", "Benjamin : - 14 ans"]),
];

const open: Field[] = [
  radio("categorie", "Catégorie", ["Double Hommes", "Double Mixte"]),
  section("s1", "Joueur 1"),
  text("j1_nom", "Nom et prénom", { required: true }),
  { key: "j1_naissance", label: "Date de naissance", type: "date", required: true },
  { key: "j1_tel", label: "Téléphone / WhatsApp", type: "tel", required: true },
  text("j1_club", "Club", { required: true }),
  section("s2", "Joueur 2"),
  text("j2_nom", "Nom et prénom", { required: true }),
  { key: "j2_naissance", label: "Date de naissance", type: "date", required: true },
  { key: "j2_tel", label: "Téléphone / WhatsApp", type: "tel", required: true },
  text("j2_club", "Club ou structure", { required: true }),
  section("s3", "Paire et paiement"),
  text("paire", "Nom de la paire (facultatif)"),
  radio("paiement", "Mode de paiement (20 000 FCFA par paire)", ["Espèces", "Mobile Money (Wave)"]),
  { key: "preuve", label: "Preuve de paiement (capture d'écran ou reçu)", type: "file", required: true, showIf: if_("paiement", "Mobile Money (Wave)") },
  { key: "accepte", label: "Je confirme l'exactitude des informations fournies et j'accepte les conditions de participation à l'Open de l'amitié – 2e édition.", type: "consent", required: true },
];

const camp: Field[] = [
  section("s1", "1. Participant"),
  text("nom", "Nom", { required: true }),
  text("prenoms", "Prénom(s)", { required: true }),
  { key: "naissance", label: "Date de naissance", type: "date", required: true },
  radio("mineur", "Le participant a-t-il moins de 18 ans ?", OUINON),
  radio("sexe", "Sexe", ["Masculin", "Féminin"]),
  { key: "telephone", label: "Téléphone du participant", type: "tel" },
  text("adresse", "Adresse / Commune", { required: true }),
  section("s2", "Parent / tuteur", { help: "Obligatoire pour les participants de moins de 18 ans.", showIf: if_("mineur", "Oui") }),
  text("parent_nom", "Nom et prénom du parent / tuteur", { required: true, showIf: if_("mineur", "Oui") }),
  radio("parent_lien", "Lien avec le participant", ["Père", "Mère", "Tuteur légal"], { other: true, showIf: if_("mineur", "Oui") }),
  { key: "parent_tel", label: "Téléphone", type: "tel", required: true, showIf: if_("mineur", "Oui") },
  { key: "parent_whatsapp", label: "WhatsApp", type: "tel", showIf: if_("mineur", "Oui") },
  text("parent_adresse", "Adresse", { required: true, showIf: if_("mineur", "Oui") }),
  section("s3", "2. Niveau de pratique"),
  radio("pratique", "Avez-vous déjà pratiqué le badminton ?", ["Non, je suis débutant(e)", "Oui, occasionnellement", "Oui, régulièrement", "Joueur/Joueuse confirmé(e)"]),
  radio("duree", "Depuis combien de temps pratiquez-vous le badminton ?", ["Moins de 1 an", "1 à 2 ans", "3 à 5 ans", "Plus de 5 ans"], { showIf: if_("pratique", "Oui, occasionnellement", "Oui, régulièrement", "Joueur/Joueuse confirmé(e)") }),
  text("club", "Club / structure actuelle (si applicable)"),
  section("s4", "3. Objectifs du camp"),
  check("objectifs", "Pourquoi souhaitez-vous participer au camp ?", ["Découvrir le badminton", "Apprendre les bases techniques", "Améliorer mon niveau", "Préparer des compétitions", "Améliorer ma condition physique", "Me perfectionner techniquement et tactiquement"], { required: true, other: true }),
  section("s5", "4. Informations sportives"),
  radio("competition", "Avez-vous une expérience en compétition ?", OUINON),
  text("competition_niveau", "Si oui, précisez votre niveau", { showIf: if_("competition", "Oui") }),
  radio("main", "Main dominante", ["Droite", "Gauche"]),
  text("categorie", "Catégorie / niveau actuel (si connu)"),
  section("s6", "5. Informations médicales", { help: "Ces informations sont communiquées de manière confidentielle à l'encadrement." }),
  radio("medical", "Le participant présente-t-il une condition particulière dont les encadreurs doivent être informés ?", ["Non", "Oui"]),
  text("medical_detail", "Précisez", { required: true, showIf: if_("medical", "Oui") }),
  radio("allergies", "Allergies connues", ["Non", "Oui"]),
  text("allergies_detail", "Précisez les allergies", { required: true, showIf: if_("allergies", "Oui") }),
  radio("traitement", "Traitement médical particulier à signaler", ["Non", "Oui"]),
  text("traitement_detail", "Précisez le traitement", { required: true, showIf: if_("traitement", "Oui") }),
  section("s7", "6. Personne à contacter en cas d'urgence"),
  text("urgence_nom", "Nom et prénom", { required: true }),
  text("urgence_lien", "Lien avec le participant", { required: true }),
  { key: "urgence_tel", label: "Téléphone principal", type: "tel", required: true },
  { key: "urgence_tel2", label: "Téléphone secondaire", type: "tel" },
  section("s8", "Autorisation parentale", { showIf: if_("mineur", "Oui") }),
  { key: "autorisation", label: "Je soussigné(e), parent / tuteur, autorise mon enfant à participer au Camp d'entraînement de badminton, et autorise l'équipe d'encadrement à prendre les dispositions nécessaires en cas d'urgence et à contacter la personne indiquée dans ce formulaire.", type: "consent", required: true, showIf: if_("mineur", "Oui") },
  section("s9", "7. Droit à l'image"),
  radio("image", "J'autorise l'utilisation de l'image du participant dans les supports de communication de l'organisation (photos et vidéos du camp)", OUINON),
  { key: "engagement", label: "Je certifie que les informations fournies dans ce formulaire sont exactes et m'engage à respecter les règles et consignes de sécurité du camp.", type: "consent", required: true },
];

export async function seed(p: pg.Pool) {
  const done = await p.query("select 1 from settings where key = 'seeded'");
  if (done.rowCount) return;
  const set = (k: string, v: string) => p.query("insert into settings (key, value) values ($1, $2) on conflict (key) do nothing", [k, v]);
  await set("site_name", "Bureau des Athlètes");
  await set("tagline", "Badminton Côte d'Ivoire");
  await set("email", "contact@exemple.ci");
  await set("phone", "+225 01 03 80 26 51");
  await set("address", "Abidjan, Côte d'Ivoire");
  await set("hero_lead", "Nous représentons, accompagnons et faisons rayonner les joueuses et joueurs de badminton de Côte d'Ivoire.");
  await set("about_lead", "Le Bureau des Athlètes est l'instance qui défend les intérêts des sportifs de haut niveau du badminton ivoirien : conditions d'entraînement, sélection, suivi médical, reconversion.");
  await set("stats", "24 | Athlètes représentés\n12 | Compétitions / an\n2 | Médailles internationales");
  await set("values", "Représenter | Porter la voix des athlètes auprès de la fédération et des institutions.\nAccompagner | Soutenir chaque joueur dans sa carrière sportive, scolaire et professionnelle.\nRayonner | Faire briller le badminton ivoirien en Afrique et dans le monde.");

  const bureau: [string, string][] = [
    ["Agnimel Akpa Jérôme Ibrahim", "Président"], ["Ban Armelle", "Co-présidente"], ["Lohoues Océane", "Secrétaire générale"],
    ["Diatta Assane", "Secrétaire général adjoint"], ["Arsene Oussou", "Trésorier"],
    ["Bahi Mandela", "Trésorier adjoint · Responsable Développement & Partenariats financiers"],
    ["Aoussi Williams", "Responsable Communication, Médias & Digitalisation"], ["Kouadio Bonin", "Responsable Communication, Médias & Digitalisation"],
    ["Konan Lucien", "Responsable Compétitions & Performance"], ["Dally Yvan Roxane", "Responsable Féminin & Inclusion para"], ["Deada Yves", "Responsable Féminin & Inclusion para"],
  ];
  for (const [i, [name, role]] of bureau.entries()) await p.query("insert into bureau (name, role, position) values ($1,$2,$3)", [name, role, i]);

  const ath: [string, string, string, number, string][] = [
    ["Athlète A", "Simple Hommes", "H", 1, "Club Abidjan"], ["Athlète B", "Simple Dames", "F", 1, "Club Yamoussoukro"],
    ["Athlète C", "Double Hommes", "H", 2, "Club Bouaké"], ["Athlète D", "Double Dames", "F", 2, "Club Abidjan"],
  ];
  for (const a of ath) await p.query("insert into athletes (name, category, gender, rank, club) values ($1,$2,$3,$4,$5)", a);

  await p.query("insert into news (title, body, date) values ($1,$2,$3),($4,$5,$6)", [
    "Inscriptions ouvertes : Open de l'amitié, Camp et Championnat", "Retrouvez tous les événements d'octobre 2026 et inscrivez-vous en ligne.", "2026-10-04",
    "Assemblée générale 2026", "Élection du nouveau bureau et présentation de la feuille de route.", "2026-07-12",
  ]);
  await p.query("insert into calendar (title, date, place) values ($1,$2,$3),($4,$5,$6),($7,$8,$9)", [
    "Open de l'amitié – 2e édition", "2026-10-24", "Hall 2 – Palais des Sports de Treichville",
    "Camp d'entraînement de badminton", "2026-10-27", "Palais des Sports de Treichville – Hall 2",
    "Championnat National de Badminton", "2026-10-29", "Palais des Sports de Treichville – Hall 2",
  ]);

  const ev = (slug: string, poster: string, title: string, hook: string, dates: string, place: string, start: string, deadline: string | null, price: string, info: string, extra: [string, string][], prog: any[], capacity: number | null, form: Field[], dedupe: string[], confirmation: string) =>
    p.query(
      `insert into events (slug, poster, title, hook, dates_label, place, start_date, deadline, price_label, infoline, extra, programme, capacity, form, dedupe, confirmation)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [slug, poster, title, hook, dates, place, start, deadline, price, info, JSON.stringify(extra), JSON.stringify(prog), capacity, JSON.stringify(form), JSON.stringify(dedupe), confirmation],
    );
  await ev("open-de-l-amitie-2026", "/posters/open-amitie-2026.jpg", "Open de l'amitié 2026 – 2e édition",
    "Le badminton unit les cultures et renforce l'amitié ! Ouvert aux Ivoiriens et aux expatriés : chinois, indiens, français, malaisiens, japonais, etc. Viens taper dans le volant !",
    "Samedi 24 octobre 2026", "Hall 2 du Palais des Sports de Treichville", "2026-10-24", "2026-10-17", "20 000 FCFA par paire", "+225 07 09 74 65 10", [],
    [{ jour: "24 octobre", discipline: "Doubles", tableaux: ["Double Hommes", "Double Mixte"] }], null, open, ["j1_nom", "j1_naissance"],
    "Merci ! L'inscription de la paire est enregistrée.");
  await ev("camp-d-entrainement-2026", "/posters/camp-2026.jpg", "Camp d'entraînement de badminton",
    "La FIBAD organise un grand camp d'entraînement pour les jeunes passionnés : 3 jours d'apprentissage, de perfectionnement et de passion, que tu sois débutant ou déjà pratiquant. Parents, entraîneurs et clubs, relayez l'information !",
    "27, 28 et 29 octobre 2026", "Palais des Sports de Treichville – Hall 2", "2026-10-27", null, "", "+225 07 77 57 71 98",
    [["Âge", "À partir de 7 ans"], ["Places limitées", "Transport pris en charge pour les 40 premiers inscrits"]],
    [{ jour: "27, 28 et 29 octobre", discipline: "Camp d'entraînement", tableaux: ["Apprentissage", "Perfectionnement", "Débutants et pratiquants"] }], 40, camp, ["nom", "prenoms", "naissance"],
    "Merci pour ton inscription ! Sport • Discipline • Performance • Plaisir.");
  await ev("championnat-national-2026", "/posters/championnat-2026.jpg", "Championnat National de Badminton 2026",
    "Le grand rendez-vous du badminton ivoirien ! Deux jours de compétition et de spectacle avec les athlètes de toute la Côte d'Ivoire.",
    "29 & 30 octobre 2026", "Palais des Sports de Treichville – Hall 2", "2026-10-29", "2026-10-17", "", "07 77 57 71 98", [],
    [
      { jour: "29 octobre", discipline: "AirBadminton", tableaux: ["Double Hommes", "Double Dames", "Double Mixte"] },
      { jour: "30 octobre", discipline: "Badminton classique", tableaux: ["Simple Hommes", "Simple Dames"] },
      { jour: "30 octobre", discipline: "Para-Badminton", tableaux: ["Simple Hommes", "Simple Dames"] },
    ], null, championnat, ["nom", "naissance"], "Merci ! Ton inscription est enregistrée.");

  await set("seeded", "1");
}
