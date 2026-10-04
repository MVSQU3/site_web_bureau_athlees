import type { ReactNode } from "react";

/** Libellé + champ, avec astérisque si obligatoire */
export function Field({ label, required, help, children, className = "" }: { label: ReactNode; required?: boolean; help?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm text-base-content/70 ${className}`}>
      <span>{label}{required && <span className="text-error"> *</span>}</span>
      {children}
      {help && <span className="text-xs text-base-content/60">{help}</span>}
    </label>
  );
}

/** Groupe de choix (radio / cases) avec légende */
export function Group({ legend, required, help, children }: { legend: ReactNode; required?: boolean; help?: string; children: ReactNode }) {
  return (
    <fieldset className="fieldset rounded-box border border-base-300 p-4">
      <legend className="fieldset-legend px-2 text-sm font-normal text-base-content/70">{legend}{required && <span className="text-error"> *</span>}</legend>
      {help && <p className="mb-2 text-sm text-base-content/60">{help}</p>}
      {children}
    </fieldset>
  );
}

export function Alert({ kind, children }: { kind: "error" | "success" | "info"; children: ReactNode }) {
  return <div role="alert" className={`alert alert-soft ${kind === "error" ? "alert-error" : kind === "success" ? "alert-success" : "alert-info"} text-sm`}>{children}</div>;
}

export const SectionTitle = ({ children }: { children: ReactNode }) => <h2 className="mb-6 mt-16 text-3xl font-bold tracking-tight">{children}</h2>;
export const PageHead = ({ eyebrow, title, lead }: { eyebrow: string; title: ReactNode; lead?: ReactNode }) => (
  <header className="mb-10">
    <p className="mb-2 text-lg font-semibold text-secondary">{eyebrow}</p>
    <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{title}</h1>
    {lead && <p className="mt-5 max-w-2xl text-lg text-base-content/60">{lead}</p>}
  </header>
);
