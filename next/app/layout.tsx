import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Bureau des Athlètes · Badminton Côte d'Ivoire", template: "%s · Bureau des Athlètes" },
  description: "Le bureau des athlètes de la Fédération Ivoirienne de Badminton : athlètes, actualités, calendrier et inscriptions aux événements.",
  icons: { icon: "/icon.png", apple: "/logo.png" },
};

const themeScript = `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
