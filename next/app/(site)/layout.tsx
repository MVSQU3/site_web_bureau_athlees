import Nav from "@/components/Nav";
import { settings } from "@/lib/util";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await settings();
  return (
    <>
      <Nav />
      <main>{children}</main>
      <footer className="border-t border-base-300 text-xs text-base-content/60">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-4 py-6"><span>© {new Date().getFullYear()} {s.site_name} — {s.tagline}</span><span>Côte d&apos;Ivoire 🇨🇮</span></div>
      </footer>
    </>
  );
}
