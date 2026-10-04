import { q } from "./db";

export const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export const fmtDateTime = (d: string | Date) => new Date(d).toLocaleString("fr-FR", { timeZone: "Africa/Abidjan" });
export const iso = (d: Date | string) => (typeof d === "string" ? d.slice(0, 10) : d.toISOString().slice(0, 10));
export const today = () => new Date().toISOString().slice(0, 10);
export const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
export const telHref = (t: string) => "tel:" + t.replace(/[^\d+]/g, "");

export async function settings(): Promise<Record<string, string>> {
  const rows = await q<{ key: string; value: string }>("select key, value from settings");
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export const lines = (s = "") =>
  s.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => l.split("|").map((x) => x.trim()));

export function eventStatus(e: { published: boolean; registrations_open: boolean; deadline: any }) {
  const dl = e.deadline ? iso(e.deadline) : null;
  if (!e.registrations_open) return "closed";
  if (dl && today() > dl) return "closed";
  return "open";
}
