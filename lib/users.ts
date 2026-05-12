import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

export interface DBUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  passwordHash?: string;
  provider: "google" | "credentials";
  createdAt: string;
}

const toClient = (row: Record<string, unknown>): DBUser => ({
  id: String(row.id ?? ""),
  email: String(row.email ?? ""),
  name: String(row.name ?? ""),
  image: row.image ? String(row.image) : undefined,
  passwordHash: row.password_hash ? String(row.password_hash) : undefined,
  provider: (row.provider as "google" | "credentials") ?? "credentials",
  createdAt: String(row.created_at ?? new Date().toISOString()),
});

export async function findUserByEmail(email: string): Promise<DBUser | null> {
  const { data, error } = await supabaseAdmin
    .from("app_users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error || !data) return null;
  return toClient(data as Record<string, unknown>);
}

export async function findUserById(id: string): Promise<DBUser | null> {
  const { data, error } = await supabaseAdmin
    .from("app_users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return toClient(data as Record<string, unknown>);
}

export async function createUser(data: Omit<DBUser, "id" | "createdAt">): Promise<DBUser> {
  const row = {
    id: crypto.randomUUID(),
    email: data.email.toLowerCase(),
    name: data.name,
    image: data.image ?? null,
    password_hash: data.passwordHash ?? null,
    provider: data.provider,
    created_at: new Date().toISOString(),
  };

  const { data: created, error } = await supabaseAdmin
    .from("app_users")
    .insert(row)
    .select("*")
    .single();

  if (error || !created) throw new Error(error?.message ?? "Kullanıcı oluşturulamadı.");
  return toClient(created as Record<string, unknown>);
}

export async function upsertGoogleUser(profile: {
  email: string;
  name: string;
  image?: string;
}): Promise<DBUser> {
  const existing = await findUserByEmail(profile.email);

  if (existing) {
    const { error } = await supabaseAdmin
      .from("app_users")
      .update({ name: profile.name, image: profile.image ?? null })
      .eq("id", existing.id);

    if (error) throw new Error(error.message);
    return { ...existing, name: profile.name, image: profile.image };
  }

  return createUser({
    email: profile.email,
    name: profile.name,
    image: profile.image,
    provider: "google",
  });
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const attempt = crypto.scryptSync(password, salt, 64).toString("hex");
  return attempt === hash;
}
