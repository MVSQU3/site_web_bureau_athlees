import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";

export default async function Panel({ children }: { children: React.ReactNode }) {
  const u = await requireUser();
  const admin = u.role === "admin";
  return (
    <div className="adm">
      <aside className="adm-side">
        <Link href="/admin" className="brand"><img className="logo" src="/logo.png" alt="" /> Back office</Link>
        <Link href="/admin">Tableau de bord</Link>
        <Link href="/admin/events">Événements</Link>
        {admin && <Link href="/admin/registrations">Inscriptions</Link>}
        <Link href="/admin/news">Actualités</Link>
        <Link href="/admin/calendar">Calendrier</Link>
        <Link href="/admin/athletes">Athlètes</Link>
        <Link href="/admin/bureau">Bureau exécutif</Link>
        {admin && <Link href="/admin/messages">Messages</Link>}
        {admin && <Link href="/admin/users">Utilisateurs</Link>}
        {admin && <Link href="/admin/settings">Réglages</Link>}
        <a href="/" target="_blank" rel="noopener">Voir le site ↗</a>
        <div className="who">{u.name || u.email}<br />{admin ? "Administrateur" : "Éditeur"}
          <form action={logoutAction}><button className="lnk" style={{ padding: "6px 0", color: "var(--acc)" }}>Déconnexion</button></form>
        </div>
      </aside>
      <div className="adm-main">{children}</div>
    </div>
  );
}
