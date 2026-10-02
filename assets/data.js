// ============================================================
// CONTENU DU SITE — remplace ces données d'exemple par le vrai contenu.
// ============================================================
window.SITE = {
  nom: "Bureau des Athlètes",
  sousTitre: "Badminton Côte d'Ivoire",
  email: "contact@exemple.ci",
  telephone: "+225 00 00 00 00 00",
  adresse: "Abidjan, Côte d'Ivoire",
  chiffres: [
    { valeur: "24", label: "Athlètes représentés" },
    { valeur: "12", label: "Compétitions / an" },
    { valeur: "8", label: "Médailles internationales" },
  ],
  valeurs: [
    { titre: "Représenter", texte: "Porter la voix des athlètes auprès de la fédération et des institutions." },
    { titre: "Accompagner", texte: "Soutenir chaque joueur dans sa carrière sportive, scolaire et professionnelle." },
    { titre: "Rayonner", texte: "Faire briller le badminton ivoirien en Afrique et dans le monde." },
  ],
  bureau: [
    { nom: "Agnimel Akpa Jérôme Ibrahim", role: "Président" },
    { nom: "Ban Armelle", role: "Co-présidente" },
    { nom: "Lohoues Océane", role: "Secrétaire générale" },
    { nom: "Diatta Assane", role: "Secrétaire général adjoint" },
    { nom: "Arsene Oussou", role: "Trésorier" },
    { nom: "Bahi Mandela", role: "Trésorier adjoint · Responsable Développement & Partenariats financiers" },
    { nom: "Aoussi Williams", role: "Responsable Communication, Médias & Digitalisation" },
    { nom: "Kouadio Bonin", role: "Responsable Communication, Médias & Digitalisation" },
    { nom: "Konan Lucien", role: "Responsable Compétitions & Performance" },
    { nom: "Dally Yvan Roxane", role: "Responsable Féminin & Inclusion para" },
    { nom: "Deada Yves", role: "Responsable Féminin & Inclusion para" },
  ],
  athletes: [
    { nom: "Athlète A", categorie: "Simple Hommes", genre: "H", classement: 1, club: "Club Abidjan" },
    { nom: "Athlète B", categorie: "Simple Dames", genre: "F", classement: 1, club: "Club Yamoussoukro" },
    { nom: "Athlète C", categorie: "Double Hommes", genre: "H", classement: 2, club: "Club Bouaké" },
    { nom: "Athlète D", categorie: "Double Dames", genre: "F", classement: 2, club: "Club Abidjan" },
    { nom: "Athlète E", categorie: "Double Mixte", genre: "H", classement: 1, club: "Club San-Pédro" },
    { nom: "Athlète F", categorie: "Double Mixte", genre: "F", classement: 1, club: "Club San-Pédro" },
    { nom: "Athlète G", categorie: "Simple Hommes", genre: "H", classement: 3, club: "Club Daloa" },
    { nom: "Athlète H", categorie: "Simple Dames", genre: "F", classement: 2, club: "Club Korhogo" },
  ],
  // Événement mis en avant (Accueil + Actualités). Mettre à null pour le retirer.
  evenement: {
    titre: "Championnat National de Badminton 2026",
    affiche: "assets/img/championnat-2026.jpg",
    accroche: "Le grand rendez-vous du badminton ivoirien ! Deux jours de compétition et de spectacle avec les athlètes de toute la Côte d'Ivoire.",
    dates: "29 & 30 octobre 2026",
    lieu: "Palais des Sports de Treichville – Hall 2",
    limite: "2026-10-17",
    infoline: "07 77 57 71 98",
    inscription: "https://docs.google.com/forms/d/e/1FAIpQLSdcZDA9zYj4QEmtb-TzuAF50_qS8KeeuwkVzdKpu-z2YTUpSg/viewform?usp=header",
    programme: [
      { jour: "29 octobre", discipline: "AirBadminton", tableaux: ["Double Hommes", "Double Dames", "Double Mixte"] },
      { jour: "30 octobre", discipline: "Badminton classique", tableaux: ["Simple Hommes", "Simple Dames"] },
      { jour: "30 octobre", discipline: "Para-Badminton", tableaux: ["Simple Hommes", "Simple Dames"] },
    ],
  },
  actualites: [
    { date: "2026-10-02", titre: "Championnat National 2026 : inscriptions ouvertes", texte: "Rendez-vous les 29 et 30 octobre au Palais des Sports de Treichville. Inscriptions jusqu'au 17 octobre." },
    { date: "2026-09-15", titre: "Bilan des Championnats d'Afrique", texte: "Retour sur les performances de nos athlètes et les médailles obtenues." },
    { date: "2026-08-30", titre: "Nouveau programme de bourses", texte: "Le bureau lance un dispositif d'accompagnement scolaire pour les jeunes talents." },
    { date: "2026-07-12", titre: "Assemblée générale 2026", texte: "Élection du nouveau bureau et présentation de la feuille de route." },
  ],
  calendrier: [
    { date: "2026-10-17", titre: "Date limite d'inscription – Championnat National", lieu: "Formulaire en ligne" },
    { date: "2026-10-29", titre: "Championnat National – AirBadminton", lieu: "Palais des Sports de Treichville – Hall 2" },
    { date: "2026-10-30", titre: "Championnat National – Badminton classique & Para-Badminton", lieu: "Palais des Sports de Treichville – Hall 2" },
    { date: "2026-10-18", titre: "Open national de Côte d'Ivoire", lieu: "Abidjan" },
    { date: "2026-11-08", titre: "Tournoi international junior", lieu: "Accra, Ghana" },
    { date: "2026-12-05", titre: "Championnat national par équipes", lieu: "Yamoussoukro" },
    { date: "2027-02-14", titre: "Championnats d'Afrique", lieu: "À confirmer" },
  ],
};
