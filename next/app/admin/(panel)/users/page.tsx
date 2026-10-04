import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtDate } from "@/lib/util";
import { deleteUser, resetPassword } from "@/lib/actions";
import UserForm from "@/components/UserForm";

export default async function Users() {
  const me = await requireUser("admin");
  const rows = await q("select id, email, name, role, created_at from users order by created_at");
  return (
    <>
      <h1>Utilisateurs</h1>
      <p className="sub-h">Les personnes qui peuvent se connecter au back office.</p>
      {rows.map((u: any) => (
        <div className="acard arow" key={u.id}>
          <div><b>{u.name || u.email}</b> <span className={"chip " + (u.role === "admin" ? "ok" : "")}>{u.role === "admin" ? "Administrateur" : "Éditeur"}</span><div className="meta">{u.email} · créé le {fmtDate(u.created_at)}</div></div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <form action={resetPassword.bind(null, u.id)} style={{ display: "flex", gap: 6 }}><input name="password" type="password" minLength={8} placeholder="Nouveau mot de passe" style={{ width: 190, padding: "6px 10px", fontSize: 14 }} required /><button className="abtn ghost sm">Changer</button></form>
            {u.id !== me.id && <form action={deleteUser.bind(null, u.id)}><button className="abtn danger sm">Supprimer</button></form>}
          </div>
        </div>
      ))}
      <UserForm />
    </>
  );
}
