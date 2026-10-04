import { Save } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { settings } from "@/lib/util";
import { saveSettings } from "@/lib/actions";
import { Field } from "@/components/ui";

export default async function Settings() {
  await requireUser("admin");
  const s = await settings();
  const F = (name: string, label: string, rows = 0, help = "") => (
    <Field label={label} help={help}>{rows ? <textarea className="textarea w-full text-base" rows={rows} name={name} defaultValue={s[name] ?? ""} /> : <input className="input w-full text-base" name={name} defaultValue={s[name] ?? ""} />}</Field>
  );
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Réglages du site</h1>
      <p className="mb-6 mt-1 text-base-content/60">Textes généraux et coordonnées.</p>
      <form action={saveSettings} className="card max-w-2xl bg-base-200">
        <div className="card-body gap-4">
          {F("site_name", "Nom du site")}{F("tagline", "Sous-titre")}{F("email", "E-mail de contact")}{F("phone", "Téléphone de contact")}{F("address", "Adresse")}
          {F("hero_lead", "Phrase d'accueil", 3)}{F("about_lead", "Texte « À propos »", 4)}
          {F("stats", "Chiffres de l'accueil", 4, "Une ligne par chiffre : Valeur | Libellé")}
          {F("values", "Valeurs (page À propos)", 5, "Une ligne par valeur : Titre | Texte")}
          <button className="btn btn-primary rounded-full"><Save size={16} />Enregistrer</button>
        </div>
      </form>
    </>
  );
}
