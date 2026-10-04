"use client";
import { useState } from "react";

type A = { id: number; name: string; category: string; gender: string; rank: number | null; club: string; photo: string | null };
const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function AthleteList({ athletes }: { athletes: A[] }) {
  const [qs, setQs] = useState("");
  const [g, setG] = useState("all");
  const list = athletes.filter((a) => (g === "all" || a.gender === g) && `${a.name} ${a.club} ${a.category}`.toLowerCase().includes(qs.trim().toLowerCase()));
  return (
    <>
      <div className="toolbar">
        <input placeholder="Rechercher un athlète, un club…" value={qs} onChange={(e) => setQs(e.target.value)} style={{ flex: 1, minWidth: 220 }} />
        <div className="seg">{[["all", "Tous"], ["F", "Dames"], ["H", "Hommes"]].map(([k, l]) => <button key={k} className={g === k ? "on" : ""} onClick={() => setG(k)}>{l}</button>)}</div>
      </div>
      <div className="grid4">
        {list.map((a) => (
          <div className="card hover" key={a.id}>
            {a.rank != null && <span className="rank">#{a.rank}</span>}
            {a.photo ? <img className="photo" src={a.photo} alt={a.name} /> : <div className="avatar">{initials(a.name)}</div>}
            <h3>{a.name}</h3><p>{a.club}</p>{a.category && <span className="tag">{a.category}</span>}
          </div>
        ))}
      </div>
      {list.length === 0 && <p className="empty">Aucun athlète ne correspond à ta recherche.</p>}
    </>
  );
}
