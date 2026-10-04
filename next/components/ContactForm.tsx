"use client";
import { useActionState } from "react";
import { submitContact } from "@/lib/actions";

export default function ContactForm() {
  const [st, act, pending] = useActionState(submitContact, null as any);
  return (
    <form className="card form" action={act}>
      <div className="row"><label>Nom complet<input name="name" required /></label><label>E-mail<input name="email" type="email" required /></label></div>
      <label>Objet<select name="subject"><option>Demande d&apos;adhésion</option><option>Partenariat</option><option>Presse</option><option>Autre</option></select></label>
      <label>Message<textarea name="body" rows={5} required /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999 }} />
      <button className="btn primary" disabled={pending}>{pending ? "Envoi…" : "Envoyer"}</button>
      {st?.error && <p className="msg err">{st.error}</p>}
      {st?.ok && <p className="msg ok">{st.ok}</p>}
    </form>
  );
}
