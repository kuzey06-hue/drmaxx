import { supabaseAdmin } from "@/lib/supabase";

type CmsRow = {
  key: string;
  value?: unknown;
  content?: unknown;
  updated_at?: string;
};

export async function readCmsContent<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabaseAdmin
    .from("cms_content")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return fallback;

  const row = data as CmsRow;
  const value = typeof row.value !== "undefined" ? row.value : row.content;
  return typeof value === "undefined" ? fallback : (value as T);
}

export async function writeCmsContent(key: string, value: unknown) {
  const row = {
    key,
    content: value,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabaseAdmin
    .from("cms_content")
    .upsert(row, { onConflict: "key" });

  if (error) throw new Error(error.message);
}
