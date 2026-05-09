import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export interface Kupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  description: string;
  createdAt: string;
}

function toClient(row: Record<string, unknown>): Kupon {
  return {
    id: row.id as string,
    code: row.code as string,
    type: row.type as "percent" | "fixed",
    value: row.value as number,
    minOrder: row.min_order as number,
    maxUses: row.max_uses as number | null,
    usedCount: row.used_count as number,
    expiresAt: row.expires_at as string | null,
    active: row.active as boolean,
    description: row.description as string,
    createdAt: row.created_at as string,
  };
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data as Record<string, unknown>[]).map(toClient));
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const code = (body.code as string).toUpperCase().trim();
  const { data: existing } = await supabaseAdmin
    .from("coupons")
    .select("id")
    .eq("code", code)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Bu kupon kodu zaten kullanılıyor." }, { status: 400 });
  }

  const row = {
    id: String(Date.now()),
    code,
    type: body.type ?? "percent",
    value: Number(body.value) || 0,
    min_order: Number(body.minOrder) || 0,
    max_uses: body.maxUses ? Number(body.maxUses) : null,
    used_count: 0,
    expires_at: body.expiresAt || null,
    active: body.active ?? true,
    description: body.description ?? "",
    created_at: new Date().toISOString().split("T")[0],
  };

  const { data, error } = await supabaseAdmin.from("coupons").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toClient(data as Record<string, unknown>), { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...rest } = body;
  const row: Record<string, unknown> = {};
  if (rest.code      !== undefined) row.code        = (rest.code as string).toUpperCase().trim();
  if (rest.type      !== undefined) row.type        = rest.type;
  if (rest.value     !== undefined) row.value       = rest.value;
  if (rest.minOrder  !== undefined) row.min_order   = rest.minOrder;
  if (rest.maxUses   !== undefined) row.max_uses    = rest.maxUses;
  if (rest.expiresAt !== undefined) row.expires_at  = rest.expiresAt;
  if (rest.active    !== undefined) row.active      = rest.active;
  if (rest.description !== undefined) row.description = rest.description;

  const { error } = await supabaseAdmin.from("coupons").update(row).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  const { error } = await supabaseAdmin.from("coupons").delete().eq("id", id!);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
