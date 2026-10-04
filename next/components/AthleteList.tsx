"use client";
import { useState } from "react";
import { Search } from "lucide-react";

type A = { id: number; name: string; category: string; gender: string; rank: number | null; club: string; photo: string | null };
const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function AthleteList({ athletes }: { athletes: A[] }) {
  const [qs, setQs] = useState("");
  const [g, setG] = useState("all");
  const list = athletes.filter((a) => (g === "all" || a.gender === g) && `${a.name} ${a.club} ${a.category}`.toLowerCase().includes(qs.trim().toLowerCase()));
  return (
    <>
      <div className="mb-8 flex flex-wrap gap-3">
        <label className="input min-w-56 flex-1"><Search size={18} className="opacity-60" /><input placeholder="Rechercher un athlète, un club…" value={qs} onChange={(e) => setQs(e.target.value)} /></label>
        <div className="join">{[["all", "Tous"], ["F", "Dames"], ["H", "Hommes"]].map(([k, l]) => <button key={k} className={"btn join-item " + (g === k ? "btn-primary" : "")} onClick={() => setG(k)}>{l}</button>)}</div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((a) => (
          <div className="card bg-base-200 transition hover:scale-[1.02] hover:bg-base-300" key={a.id} data-testid="athlete">
            <div className="card-body">
              {a.rank != null && <span className="absolute right-5 top-5 text-sm font-semibold text-accent">#{a.rank}</span>}
              {a.photo
                ? <img className="mb-2 size-[72px] rounded-full border border-base-300 object-cover" src={a.photo} alt={a.name} />
                : <div className="avatar avatar-placeholder mb-2"><div className="w-[72px] rounded-full border border-base-300 bg-neutral text-2xl text-neutral-content">{initials(a.name)}</div></div>}
              <h3 className="card-title text-lg">{a.name}</h3><p className="text-sm text-base-content/60">{a.club}</p>
              {a.category && <div className="badge badge-neutral mt-1">{a.category}</div>}
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 && <p className="py-10 text-center text-base-content/60">Aucun athlète ne correspond à ta recherche.</p>}
    </>
  );
}
