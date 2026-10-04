// Ressources simples gérées par le back office (liste + formulaire générés à partir de cette config)
export type RField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "number" | "select" | "image" | "checkbox";
  options?: [string, string][];
  required?: boolean;
  help?: string;
};
export type Resource = {
  table: string;
  label: string;
  singular: string;
  fields: RField[];
  columns: string[];
  order: string;
};

export const RESOURCES: Record<string, Resource> = {
  news: {
    table: "news", label: "Actualités", singular: "actualité", order: "date desc, id desc", columns: ["date", "title", "published"],
    fields: [
      { name: "title", label: "Titre", type: "text", required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "body", label: "Texte", type: "textarea" },
      { name: "image", label: "Image (facultatif)", type: "image" },
      { name: "published", label: "Publiée sur le site", type: "checkbox" },
    ],
  },
  calendar: {
    table: "calendar", label: "Calendrier", singular: "date", order: "date asc", columns: ["date", "title", "place"],
    fields: [
      { name: "title", label: "Intitulé", type: "text", required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "place", label: "Lieu", type: "text" },
    ],
  },
  athletes: {
    table: "athletes", label: "Athlètes", singular: "athlète", order: "name asc", columns: ["name", "category", "club", "rank"],
    fields: [
      { name: "name", label: "Nom et prénom", type: "text", required: true },
      { name: "category", label: "Catégorie (ex : Simple Hommes)", type: "text" },
      { name: "gender", label: "Genre", type: "select", options: [["H", "Homme"], ["F", "Femme"]], required: true },
      { name: "rank", label: "Classement", type: "number" },
      { name: "club", label: "Club", type: "text" },
      { name: "photo", label: "Photo (facultatif)", type: "image" },
      { name: "published", label: "Visible sur le site", type: "checkbox" },
    ],
  },
  bureau: {
    table: "bureau", label: "Bureau exécutif", singular: "membre", order: "position asc, id asc", columns: ["position", "name", "role"],
    fields: [
      { name: "name", label: "Nom et prénom", type: "text", required: true },
      { name: "role", label: "Rôle", type: "text" },
      { name: "position", label: "Ordre d'affichage (0 = en premier)", type: "number" },
      { name: "photo", label: "Photo (facultatif)", type: "image" },
    ],
  },
};
