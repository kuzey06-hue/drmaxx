import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const toClient = (row: Record<string, unknown>) => ({
  id: Number(row.id ?? 0),
  name: String(row.name ?? ""),
  email: String(row.email ?? ""),
  role: String(row.role ?? "Editör"),
  status: String(row.status ?? "Aktif"),
  createdAt: String(row.created_at ?? new Date().toISOString()),
});

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map((row) => toClient(row as Record<string, unknown>)));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const row = {
    name: String(body.name ?? "").trim(),
    email: String(body.email ?? "").trim().toLowerCase(),
    role: String(body.role ?? "Editör"),
    status: String(body.status ?? "Aktif"),
    created_at: new Date().toISOString(),
  };

  if (!row.name || !row.email) {
    return NextResponse.json({ error: "Ad soyad ve e-posta zorunlu." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .insert(row)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toClient(data as Record<string, unknown>), { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const id = Number(body.id ?? 0);
  if (!id) return NextResponse.json({ error: "ID zorunlu." }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (body.name !== undefined) update.name = body.name;
  if (body.email !== undefined) update.email = String(body.email).toLowerCase();
  if (body.role !== undefined) update.role = body.role;
  if (body.status !== undefined) update.status = body.status;

  const { error } = await supabaseAdmin.from("admin_users").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = Number(new URL(req.url).searchParams.get("id") ?? 0);
  if (!id) return NextResponse.json({ error: "ID zorunlu." }, { status: 400 });

  const { error } = await supabaseAdmin.from("admin_users").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
