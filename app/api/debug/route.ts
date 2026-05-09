import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "YOK";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "YOK";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "YOK";

  const { data, error, count } = await supabaseAdmin
    .from("products")
    .select("*", { count: "exact" });

  return NextResponse.json({
    url: url.slice(0, 30),
    anonKey: anonKey.slice(0, 20) + "...",
    serviceKey: serviceKey.slice(0, 20) + "...",
    rowCount: data?.length ?? 0,
    error: error?.message ?? null,
    count,
  });
}
