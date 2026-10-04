"use client";
import { useActionState } from "react";
import { createUser } from "@/lib/actions";

export default function UserForm() {
  const [st, act, pending] = useActionState(createUser, null as any);
  return (
    <form action={act} className="acard" style={{ maxWidth: 520 }}>
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Ajouter un compte</h2>
      <label className="afield">Nom<input name="name" /></label>
      <label className="afield">E-mail *<input name="email" type="email" required /></label>
      <label className="afield">Mot de passe * (8 caractères minimum)<input name="password" type="password" minLength={8} required autoComplete="new-password" /></label>
      <label className="afield">Rôle<select name="role"><option value="editor">Éditeur (contenu du site, sans les données personnelles)</option><option value="admin">Administrateur (tout)</option></select></label>
      <button className="abtn" disabled={pending}>Créer le compte</button>
      {st?.error && <p className="msg err">{st.error}</p>}{st?.ok && <p className="msg ok">{st.ok}</p>}
    </form>
  );
}
