import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Bureau des Athlètes · Badminton Côte d'Ivoire", template: "%s · Bureau des Athlètes" },
  description: "Le bureau des athlètes de la Fédération Ivoirienne de Badminton : athlètes, actualités, calendrier et inscriptions aux événements.",
  icons: { icon: "/icon.png", apple: "/logo.png" },
};

// Applique le thème mémorisé avant l'affichage (évite le flash)
const themeScript = `try{var t=localStorage.getItem("theme");document.documentElement.dataset.theme=t==="light"?"fibad-light":"fibad-dark"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="fibad-dark" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="min-h-screen bg-base-100 font-sans text-base-content">{children}</body>
    </html>
  );
}
