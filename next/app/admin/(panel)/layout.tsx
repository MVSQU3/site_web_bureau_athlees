import Link from "next/link";
import { LogOut, Menu } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import AdminNav, { type NavItem } from "@/components/AdminNav";
import ThemeToggle from "@/components/ThemeToggle";

export default async function Panel({ children }: { children: React.ReactNode }) {
  const u = await requireUser();
  const admin = u.role === "admin";
  const items: NavItem[] = [
    { href: "/admin", label: "Tableau de bord", icon: "LayoutDashboard" },
    { href: "/admin/events", label: "Événements", icon: "CalendarCheck" },
    ...(admin ? [{ href: "/admin/registrations", label: "Inscriptions", icon: "ClipboardList" } as NavItem] : []),
    { href: "/admin/news", label: "Actualités", icon: "Newspaper" },
    { href: "/admin/calendar", label: "Calendrier", icon: "CalendarDays" },
    { href: "/admin/athletes", label: "Athlètes", icon: "Trophy" },
    { href: "/admin/bureau", label: "Bureau exécutif", icon: "UserRound" },
    ...(admin ? [
      { href: "/admin/messages", label: "Messages", icon: "MessageSquare" } as NavItem,
      { href: "/admin/users", label: "Utilisateurs", icon: "UserCog" } as NavItem,
      { href: "/admin/settings", label: "Réglages", icon: "Settings" } as NavItem,
    ] : []),
  ];
  return (
    <div className="drawer lg:drawer-open">
      <input id="adm-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content min-w-0">
        <div className="navbar border-b border-base-300 bg-base-100 lg:hidden">
          <label htmlFor="adm-drawer" className="btn btn-ghost btn-circle" aria-label="Menu"><Menu size={22} /></label>
          <span className="flex-1 font-semibold">Back office</span><ThemeToggle />
        </div>
        <div className="mx-auto max-w-5xl p-4 sm:p-8">{children}</div>
      </div>
      <div className="drawer-side z-40">
        <label htmlFor="adm-drawer" className="drawer-overlay" aria-label="Fermer" />
        <aside className="flex min-h-full w-64 flex-col gap-2 border-r border-base-300 bg-base-200 p-4">
          <Link href="/admin" className="flex items-center gap-3 px-2 pb-4 pt-2 font-semibold"><img className="size-9 rounded-full" src="/logo.png" alt="" />Back office</Link>
          <AdminNav items={items} />
          <div className="mt-auto border-t border-base-300 pt-4 text-sm">
            <div className="px-2 font-medium">{u.name || u.email}</div>
            <div className="mb-2 px-2 text-xs text-base-content/60">{admin ? "Administrateur" : "Éditeur"}</div>
            <div className="flex items-center gap-1">
              <form action={logoutAction} className="flex-1"><button className="btn btn-ghost btn-sm w-full justify-start"><LogOut size={16} />Déconnexion</button></form>
              <span className="max-lg:hidden"><ThemeToggle /></span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
