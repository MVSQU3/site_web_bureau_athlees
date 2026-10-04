// Définition et validation des formulaires d'inscription (partagées client / serveur)
export type FieldType = "section" | "text" | "textarea" | "tel" | "email" | "date" | "number" | "select" | "radio" | "checkbox" | "file" | "consent";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  other?: boolean; // radio / checkbox : ajoute « Autre : … »
  help?: string;
  showIf?: { key: string; in: string[] }; // visible si la réponse à `key` est l'une de ces valeurs
};

export const TYPE_LABELS: Record<FieldType, string> = {
  section: "Titre de section",
  text: "Texte court",
  textarea: "Paragraphe",
  tel: "Téléphone",
  email: "E-mail",
  date: "Date",
  number: "Nombre",
  select: "Liste déroulante",
  radio: "Choix unique",
  checkbox: "Cases à cocher",
  file: "Fichier (image ou PDF)",
  consent: "Case à accepter",
};

export const FILE_MIMES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const FILE_MAX = 3 * 1024 * 1024;

export function isVisible(f: Field, data: Record<string, any>): boolean {
  if (!f.showIf?.key) return true;
  const v = data[f.showIf.key];
  const arr = Array.isArray(v) ? v : v === undefined || v === "" ? [] : [v];
  return arr.some((x) => f.showIf!.in.includes(String(x)));
}

const isOther = (v: string) => /^Autre : \S/.test(v);

export type Validated = { data: Record<string, any>; errors: string[]; fileKeys: string[] };

/** Valide les réponses selon la définition. Ne garde que les champs visibles. */
export function validate(fields: Field[], raw: Record<string, any>, hasFile: (key: string) => boolean): Validated {
  const data: Record<string, any> = {};
  const errors: string[] = [];
  const fileKeys: string[] = [];
  const text = (v: any, max: number) => String(v ?? "").trim().slice(0, max);
  for (const f of fields) {
    if (f.type === "section") continue;
    if (!isVisible(f, data)) continue;
    const bad = (m = "invalide") => errors.push(`${f.label} : ${m}`);
    const need = () => errors.push(`${f.label} : obligatoire`);
    switch (f.type) {
      case "file": {
        if (hasFile(f.key)) fileKeys.push(f.key);
        else if (f.required) need();
        break;
      }
      case "consent": {
        const ok = raw[f.key] === true || raw[f.key] === "true" || raw[f.key] === "on";
        if (ok) data[f.key] = true;
        else if (f.required) need();
        break;
      }
      case "checkbox": {
        const arr = (Array.isArray(raw[f.key]) ? raw[f.key] : [])
          .map((x: any) => text(x, 200))
          .filter((x: string) => (f.options || []).includes(x) || (f.other && isOther(x)));
        if (arr.length) data[f.key] = [...new Set(arr)];
        else if (f.required) need();
        break;
      }
      case "radio":
      case "select": {
        const v = text(raw[f.key], 200);
        if (!v) { if (f.required) need(); break; }
        if ((f.options || []).includes(v) || (f.other && isOther(v))) data[f.key] = v;
        else bad();
        break;
      }
      default: {
        const v = text(raw[f.key], f.type === "textarea" ? 5000 : 300);
        if (!v) { if (f.required) need(); break; }
        if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { bad("e-mail invalide"); break; }
        if (f.type === "date" && (!/^\d{4}-\d{2}-\d{2}$/.test(v) || isNaN(Date.parse(v)))) { bad("date invalide"); break; }
        if (f.type === "number" && isNaN(Number(v))) { bad("nombre invalide"); break; }
        if (f.type === "tel" && !/^[+()\d\s.-]{6,30}$/.test(v)) { bad("numéro invalide"); break; }
        data[f.key] = v;
      }
    }
  }
  return { data, errors, fileKeys };
}

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40) || "champ";
