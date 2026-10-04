"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const LINKS = [["/", "Accueil"], ["/a-propos", "À propos"], ["/athletes", "Athlètes"], ["/actualites", "Actualités"], ["/calendrier", "Calendrier"]];

export default function Nav() {
  const path = usePathname();
  const act = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  const close = () => (document.activeElement as HTMLElement | null)?.blur();
  const item = (h: string, l: string) => <li key={h}><Link href={h} onClick={close} className={act(h) ? "font-semibold text-base-content" : "text-base-content/60"}>{l}</Link></li>;
  return (
    <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/75 backdrop-blur-xl">
      <div className="navbar mx-auto max-w-6xl px-4">
        <div className="navbar-start">
          <Link href="/" aria-label="Accueil"><img className="size-9 rounded-full" src="/logo.png" alt="Logo FIBAD – Commission des Athlètes" width={36} height={36} /></Link>
        </div>
        <nav className="navbar-center hidden md:flex">
          <ul className="menu menu-horizontal gap-1 text-sm">{LINKS.map(([h, l]) => item(h, l))}</ul>
        </nav>
        <div className="navbar-end gap-1">
          <Link href="/contact" className="btn btn-sm rounded-full bg-base-content text-base-100 hover:opacity-80 max-md:hidden">Contact</Link>
          <ThemeToggle />
          <div className="dropdown dropdown-end md:hidden">
            <button tabIndex={0} className="btn btn-ghost btn-circle btn-sm" aria-label="Menu"><Menu size={20} /></button>
            <ul tabIndex={0} className="menu dropdown-content z-40 mt-3 w-56 rounded-box border border-base-300 bg-base-200 p-2 text-base shadow-xl">
              {LINKS.map(([h, l]) => item(h, l))}
              <li><Link href="/contact" onClick={close} className={act("/contact") ? "font-semibold" : ""}>Contact</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
