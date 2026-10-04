import { Trash2, KeyRound } from "lucide-react";
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
      <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
      <p className="mb-6 mt-1 text-base-content/60">Les personnes qui peuvent se connecter au back office.</p>
      <div className="space-y-3">
        {rows.map((u: any) => (
          <div className="card bg-base-200" key={u.id}>
            <div className="card-body flex-row flex-wrap items-center justify-between gap-4 py-4">
              <div><div className="flex items-center gap-2"><b>{u.name || u.email}</b><span className={"badge " + (u.role === "admin" ? "badge-success" : "badge-neutral")}>{u.role === "admin" ? "Administrateur" : "Éditeur"}</span></div><div className="text-sm text-base-content/60">{u.email} · créé le {fmtDate(u.created_at)}</div></div>
              <div className="flex flex-wrap items-center gap-2">
                <form action={resetPassword.bind(null, u.id)} className="join"><input className="input input-sm join-item w-48" name="password" type="password" minLength={8} placeholder="Nouveau mot de passe" required autoComplete="new-password" /><button className="btn btn-sm join-item"><KeyRound size={14} />Changer</button></form>
                {u.id !== me.id && <form action={deleteUser.bind(null, u.id)}><button className="btn btn-ghost btn-sm text-error"><Trash2 size={14} />Supprimer</button></form>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <UserForm />
    </>
  );
}
