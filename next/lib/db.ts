import pg from "pg";
import bcrypt from "bcryptjs";
import { SCHEMA } from "./schema";
import { seed } from "./seed";

// Les colonnes DATE restent des chaînes « AAAA-MM-JJ » (pas de décalage de fuseau)
pg.types.setTypeParser(1082, (v: string) => v);

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;

declare global {
  // eslint-disable-next-line no-var
  var __pool: pg.Pool | undefined;
  // eslint-disable-next-line no-var
  var __ready: Promise<void> | undefined;
}

function pool(): pg.Pool {
  if (!url) throw new Error("DATABASE_URL manquant : crée le fichier next/.env.local (voir next/.env.example) puis relance « npm run dev ».");
  if (!globalThis.__pool) {
    const u = new URL(url);
    const local = ["localhost", "127.0.0.1"].includes(u.hostname);
    u.searchParams.delete("sslmode"); // SSL géré ci-dessous (certificat vérifié)
    u.searchParams.delete("channel_binding");
    globalThis.__pool = new pg.Pool({
      connectionString: u.toString(),
      ssl: local ? false : { rejectUnauthorized: true },
      max: Number(process.env.PG_POOL_MAX) || 3,
    });
  }
  return globalThis.__pool;
}

async function init() {
  const p = pool();
  await p.query(SCHEMA);
  // Premier administrateur : créé depuis ADMIN_EMAIL / ADMIN_PASSWORD si aucun compte n'existe
  const { rows } = await p.query("select count(*)::int as n from users");
  if (
    rows[0].n === 0 &&
    process.env.ADMIN_EMAIL &&
    process.env.ADMIN_PASSWORD
  ) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await p.query(
      "insert into users (email, name, password_hash, role) values ($1, $2, $3, 'admin') on conflict do nothing",
      [
        process.env.ADMIN_EMAIL.trim().toLowerCase(),
        process.env.ADMIN_EMAIL.split("@")[0],
        hash,
      ],
    );
  }
  await seed(p);
}

export async function db(): Promise<pg.Pool> {
  globalThis.__ready ??= init().catch((e) => {
    globalThis.__ready = undefined; // réessaie au prochain appel
    throw e;
  });
  await globalThis.__ready;
  return pool();
}

export async function q<T = any>(
  text: string,
  params: any[] = [],
): Promise<T[]> {
  const p = await db();
  return (await p.query(text, params)).rows as T[];
}

export async function one<T = any>(
  text: string,
  params: any[] = [],
): Promise<T | null> {
  return (await q<T>(text, params))[0] ?? null;
}
