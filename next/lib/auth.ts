import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { one } from "./db";

const COOKIE = "session";
const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET manquant (16 caractères minimum)");
  return new TextEncoder().encode(s);
};

export type User = { id: number; email: string; name: string; role: "admin" | "editor" };

// Limite de tentatives de connexion (par instance serveur) : 6 essais / 10 min / (IP + e-mail)
const tries = new Map<string, { n: number; t: number }>();
async function throttled(email: string) {
  const h = await headers();
  const key = `${(h.get("x-forwarded-for") || "").split(",")[0].trim()}|${email}`;
  const now = Date.now();
  const e = tries.get(key);
  if (!e || now - e.t > 600_000) { tries.set(key, { n: 1, t: now }); return { key, blocked: false }; }
  e.n++;
  return { key, blocked: e.n > 6 };
}

export async function login(email: string, password: string): Promise<boolean> {
  email = email.trim().toLowerCase();
  const { key, blocked } = await throttled(email);
  if (blocked) return false;
  const u = await one<any>("select * from users where email = $1", [email]);
  // comparaison faite même si l'utilisateur n'existe pas (temps constant approximatif)
  const ok = await bcrypt.compare(password, u?.password_hash || "$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi");
  if (!u || !ok) return false;
  tries.delete(key);
  const jwt = await new SignJWT({ uid: u.id }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret());
  (await cookies()).set(COOKIE, jwt, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 7 * 86400 });
  return true;
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const u = await one<User>("select id, email, name, role from users where id = $1", [Number(payload.uid)]);
    return u;
  } catch {
    return null;
  }
}

/** À appeler en tête de chaque page / action admin. `role: "admin"` réserve l'accès aux administrateurs. */
export async function requireUser(role?: "admin"): Promise<User> {
  const u = await currentUser();
  if (!u) redirect("/admin/login");
  if (role === "admin" && u.role !== "admin") redirect("/admin");
  return u;
}
