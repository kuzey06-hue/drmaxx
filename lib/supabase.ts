import { createClient, SupabaseClient } from "@supabase/supabase-js";

const getUrl = () =>
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";

const getAnonKey = () =>
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

const getServiceKey = () =>
  process.env.SUPABASE_SERVICE_ROLE_KEY || getAnonKey();

const opts = {
  global: {
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, { ...init, cache: "no-store" as RequestCache }),
  },
};

// Singleton — sadece ilk çağrıda oluşturulur
let _anon: SupabaseClient | null = null;
let _admin: SupabaseClient | null = null;

export const getSupabase = () => {
  if (!_anon) _anon = createClient(getUrl(), getAnonKey(), opts);
  return _anon;
};

export const getSupabaseAdmin = () => {
  if (!_admin) _admin = createClient(getUrl(), getServiceKey(), opts);
  return _admin;
};

// Geriye dönük uyumluluk
export const supabase = {
  from: (...args: Parameters<SupabaseClient["from"]>) => getSupabase().from(...args),
} as unknown as SupabaseClient;

export const supabaseAdmin = {
  from: (...args: Parameters<SupabaseClient["from"]>) => getSupabaseAdmin().from(...args),
} as unknown as SupabaseClient;
