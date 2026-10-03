import pg from "pg";

// URL Postgres fournie par l'intégration Vercel Storage (Neon) — ou toute base Postgres.
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
let pool, ready;

export async function db() {
  if (!url) throw new Error("DATABASE_URL manquant");
  if (!pool) {
    // SSL géré ici (certificat vérifié) : on retire sslmode de l'URL pour éviter l'avertissement de pg
    const u = new URL(url);
    u.searchParams.delete("sslmode");
    pool = new pg.Pool({
      connectionString: u.toString(),
      ssl: { rejectUnauthorized: true },
      max: 1,
    });
  }
  ready ??= pool.query(`create table if not exists messages (
    id serial primary key,
    created_at timestamptz not null default now(),
    nom text not null,
    email text not null,
    objet text not null,
    message text not null
  );
  create table if not exists inscriptions (
    id serial primary key,
    created_at timestamptz not null default now(),
    nom text not null,
    naissance date not null,
    sexe text not null,
    club text not null,
    licencie boolean,
    competitions text[] not null default '{}',
    tableaux text[] not null,
    partenaire text not null default '',
    categorie text,
    telephone text
  );
  -- mise à niveau d'une ancienne version de la table
  alter table inscriptions add column if not exists licencie boolean;
  alter table inscriptions add column if not exists competitions text[] not null default '{}';
  alter table inscriptions add column if not exists categorie text;
  alter table inscriptions alter column telephone drop not null;
  do $$ begin
    if exists (select 1 from information_schema.columns where table_name = 'inscriptions' and column_name = 'prenom') then
      alter table inscriptions alter column prenom drop not null;
      alter table inscriptions alter column email drop not null;
    end if;
  end $$;
  create table if not exists open_inscriptions (
    id serial primary key,
    created_at timestamptz not null default now(),
    categorie text not null,
    j1_nom text not null,
    j1_naissance date not null,
    j1_tel text not null,
    j1_club text not null,
    j2_nom text not null,
    j2_naissance date not null,
    j2_tel text not null,
    j2_club text not null,
    paire text not null default '',
    paiement text not null,
    preuve text,
    paye boolean not null default false
  )`);
  await ready.catch((e) => {
    ready = undefined;
    throw e;
  }); // réessaie au prochain appel en cas d'échec
  return pool;
}
