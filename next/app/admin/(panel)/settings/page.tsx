import { requireUser } from "@/lib/auth";
import { settings } from "@/lib/util";
import { saveSettings } from "@/lib/actions";

export default async function Settings() {
  await requireUser("admin");
  const s = await settings();
  const F = (name: string, label: string, rows = 0, help = "") => (
    <label className="afield">{label}{rows ? <textarea name={name} rows={rows} defaultValue={s[name] ?? ""} /> : <input name={name} defaultValue={s[name] ?? ""} />}{help && <small>{help}</small>}</label>
  );
  return (
    <>
      <h1>Réglages du site</h1>
      <p className="sub-h">Textes généraux et coordonnées.</p>
      <form action={saveSettings} className="acard" style={{ maxWidth: 680 }}>
        {F("site_name", "Nom du site")}{F("tagline", "Sous-titre")}{F("email", "E-mail de contact")}{F("phone", "Téléphone de contact")}{F("address", "Adresse")}
        {F("hero_lead", "Phrase d'accueil", 3)}{F("about_lead", "Texte « À propos »", 4)}
        {F("stats", "Chiffres de l'accueil", 4, "Une ligne par chiffre : Valeur | Libellé")}
        {F("values", "Valeurs (page À propos)", 5, "Une ligne par valeur : Titre | Texte")}
        <button className="abtn">Enregistrer</button>
      </form>
    </>
  );
}
