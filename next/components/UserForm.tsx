"use client";
import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { createUser } from "@/lib/actions";
import { Field, Alert } from "./ui";

export default function UserForm() {
  const [st, act, pending] = useActionState(createUser, null as any);
  return (
    <form action={act} className="card mt-8 max-w-xl bg-base-200">
      <div className="card-body gap-4">
        <h2 className="text-lg font-semibold">Ajouter un compte</h2>
        <Field label="Nom"><input className="input w-full text-base" name="name" /></Field>
        <Field label="E-mail" required><input className="input w-full text-base" name="email" type="email" required /></Field>
        <Field label="Mot de passe (8 caractères minimum)" required><input className="input w-full text-base" name="password" type="password" minLength={8} required autoComplete="new-password" /></Field>
        <Field label="Rôle"><select className="select w-full text-base" name="role"><option value="editor">Éditeur (contenu du site, sans les données personnelles)</option><option value="admin">Administrateur (tout)</option></select></Field>
        <button className="btn btn-primary rounded-full" disabled={pending}><UserPlus size={16} />Créer le compte</button>
        {st?.error && <Alert kind="error">{st.error}</Alert>}{st?.ok && <Alert kind="success">{st.ok}</Alert>}
      </div>
    </form>
  );
}
