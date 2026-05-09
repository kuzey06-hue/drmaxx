import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const FILE = path.join(process.cwd(), "data", "cms", "users.json");

export interface DBUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  passwordHash?: string;
  provider: "google" | "credentials";
  createdAt: string;
}

async function readUsers(): Promise<DBUser[]> {
  try { return JSON.parse(await fs.readFile(FILE, "utf-8")); }
  catch { return []; }
}

async function writeUsers(users: DBUser[]) {
  await fs.writeFile(FILE, JSON.stringify(users, null, 2), "utf-8");
}

export async function findUserByEmail(email: string): Promise<DBUser | null> {
  const users = await readUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function findUserById(id: string): Promise<DBUser | null> {
  const users = await readUsers();
  return users.find(u => u.id === id) ?? null;
}

export async function createUser(data: Omit<DBUser, "id" | "createdAt">): Promise<DBUser> {
  const users = await readUsers();
  const user: DBUser = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  await writeUsers([...users, user]);
  return user;
}

export async function upsertGoogleUser(profile: {
  email: string;
  name: string;
  image?: string;
}): Promise<DBUser> {
  const existing = await findUserByEmail(profile.email);
  if (existing) {
    // Profil bilgilerini güncelle
    const users = await readUsers();
    const updated = users.map(u =>
      u.id === existing.id
        ? { ...u, name: profile.name, image: profile.image }
        : u
    );
    await writeUsers(updated);
    return { ...existing, name: profile.name, image: profile.image };
  }
  return createUser({ ...profile, provider: "google" });
}

// Şifre hashleme — Node.js crypto ile
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const attempt = crypto.scryptSync(password, salt, 64).toString("hex");
  return attempt === hash;
}
