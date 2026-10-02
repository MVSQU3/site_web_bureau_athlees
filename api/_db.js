import pg from "pg";

// URL Postgres fournie par l'intégration Vercel Storage (Neon) — ou toute base Postgres.
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
let pool, ready;

export async function db() {
  if (!url) throw new Error("DATABASE_URL manquant");
  pool ??= new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, max: 1 });
  ready ??= pool.query(`create table if not exists messages (
    id serial primary key,
    created_at timestamptz not null default now(),
    nom text not null,
    email text not null,
    objet text not null,
    message text not null
  )`);
  await ready;
  return pool;
}
