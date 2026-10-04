import Nav from "@/components/Nav";
import { settings } from "@/lib/util";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await settings();
  return (
    <>
      <Nav />
      <main>{children}</main>
      <footer className="foot"><div className="wrap"><span>© {new Date().getFullYear()} {s.site_name} — {s.tagline}</span><span>Côte d&apos;Ivoire 🇨🇮</span></div></footer>
    </>
  );
}
