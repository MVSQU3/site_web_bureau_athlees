"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const LINKS = [["/", "Accueil"], ["/a-propos", "À propos"], ["/athletes", "Athlètes"], ["/actualites", "Actualités"], ["/calendrier", "Calendrier"]];

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const act = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  return (
    <header className="nav">
      <div className="nav-in">
        <Link href="/" className="brand" aria-label="Accueil"><img className="logo" src="/logo.png" alt="Logo FIBAD – Commission des Athlètes" width={34} height={34} /></Link>
        <div className="nav-r">
          <ThemeToggle />
          <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /></button>
          <nav className={"links" + (open ? " open" : "")} onClick={() => setOpen(false)}>
            {LINKS.map(([h, l]) => <Link key={h} href={h} className={act(h) ? "act" : ""}>{l}</Link>)}
            <Link href="/contact" className="cta">Contact</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
