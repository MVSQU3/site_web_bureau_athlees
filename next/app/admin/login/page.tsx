"use client";
import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction } from "@/lib/actions";
import { Field, Alert } from "@/components/ui";

export default function Login() {
  const [st, act, pending] = useActionState(loginAction, null as any);
  return (
    <div className="mx-auto mt-[10vh] max-w-sm px-4">
      <img className="mb-4 size-16 rounded-full" src="/logo.png" alt="" />
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Back office</h1>
      <form className="card bg-base-200" action={act}>
        <div className="card-body gap-4">
          <Field label="E-mail"><input className="input w-full text-base" name="email" type="email" required autoComplete="username" defaultValue={st?.email ?? ""} /></Field>
          <Field label="Mot de passe"><input className="input w-full text-base" name="password" type="password" required autoComplete="current-password" /></Field>
          <button className="btn btn-primary rounded-full" disabled={pending}>{pending ? <span className="loading loading-spinner" /> : <LogIn size={18} />}{pending ? "Connexion…" : "Se connecter"}</button>
          {st?.error && <Alert kind="error">{st.error}</Alert>}
        </div>
      </form>
    </div>
  );
}
