"use client";
import { useActionState } from "react";
import { loginAction } from "@/lib/actions";

export default function Login() {
  const [st, act, pending] = useActionState(loginAction, null as any);
  return (
    <div className="login-box">
      <img className="logo" src="/logo.png" alt="" style={{ width: 64, height: 64, marginBottom: 16 }} />
      <h1 style={{ fontSize: 30, marginBottom: 20 }}>Back office</h1>
      <form className="form" action={act}>
        <label>E-mail<input name="email" type="email" required autoComplete="username" defaultValue={st?.email ?? ""} /></label>
        <label>Mot de passe<input name="password" type="password" required autoComplete="current-password" /></label>
        <button className="btn primary" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>
        {st?.error && <p className="msg err">{st.error}</p>}
      </form>
    </div>
  );
}
