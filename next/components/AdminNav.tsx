"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, CalendarCheck, ClipboardList, Newspaper, CalendarDays, Trophy, UserRound, MessageSquare, UserCog, Settings, ExternalLink } from "lucide-react";

const ICONS: Record<string, any> = { LayoutDashboard, CalendarCheck, ClipboardList, Newspaper, CalendarDays, Trophy, UserRound, MessageSquare, UserCog, Settings };

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS };

export default function AdminNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  // referme le menu mobile après chaque navigation
  useEffect(() => { const c = document.getElementById("adm-drawer") as HTMLInputElement | null; if (c) c.checked = false; }, [path]);
  return (
    <ul className="menu w-full gap-1 p-0 text-base">
      {items.map((i) => {
        const Icon = ICONS[i.icon];
        const on = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
        return <li key={i.href}><Link href={i.href} className={on ? "menu-active" : ""}><Icon size={18} />{i.label}</Link></li>;
      })}
      <li><a href="/" target="_blank" rel="noopener"><ExternalLink size={18} />Voir le site</a></li>
    </ul>
  );
}
