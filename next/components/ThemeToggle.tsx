"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => setLight(document.documentElement.dataset.theme === "fibad-light"), []);
  return (
    <button className="btn btn-ghost btn-circle btn-sm" aria-label="Changer de thème" onClick={() => {
      document.documentElement.dataset.theme = light ? "fibad-dark" : "fibad-light";
      try { localStorage.setItem("theme", light ? "dark" : "light"); } catch {}
      setLight(!light);
    }}>{light ? <Moon size={18} /> : <Sun size={18} />}</button>
  );
}
