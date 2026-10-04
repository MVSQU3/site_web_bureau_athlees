"use client";
import { useActionState } from "react";
import { Send } from "lucide-react";
import { submitContact } from "@/lib/actions";
import { Field, Alert } from "./ui";

export default function ContactForm() {
  const [st, act, pending] = useActionState(submitContact, null as any);
  return (
    <form className="card bg-base-200" action={act}>
      <div className="card-body gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom complet"><input className="input w-full text-base" name="name" required /></Field>
          <Field label="E-mail"><input className="input w-full text-base" name="email" type="email" required /></Field>
        </div>
        <Field label="Objet"><select className="select w-full text-base" name="subject"><option>Demande d&apos;adhésion</option><option>Partenariat</option><option>Presse</option><option>Autre</option></select></Field>
        <Field label="Message"><textarea className="textarea h-36 w-full text-base" name="body" required /></Field>
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />
        <button className="btn btn-primary rounded-full" disabled={pending}>{pending ? <span className="loading loading-spinner" /> : <Send size={18} />}{pending ? "Envoi…" : "Envoyer"}</button>
        {st?.error && <Alert kind="error">{st.error}</Alert>}
        {st?.ok && <Alert kind="success">{st.ok}</Alert>}
      </div>
    </form>
  );
}
