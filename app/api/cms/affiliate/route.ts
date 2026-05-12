import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

type AffiliateLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  instagram: string;
  website: string;
  channel: string;
  message: string;
  status: "new" | "approved" | "rejected";
  adminNote: string;
  createdAt: string;
  updatedAt: string;
};

const toClient = (row: Record<string, unknown>): AffiliateLead => ({
  id: String(row.id ?? ""),
  name: String(row.name ?? ""),
  email: String(row.email ?? ""),
  phone: String(row.phone ?? ""),
  city: String(row.city ?? ""),
  instagram: String(row.instagram ?? ""),
  website: String(row.website ?? ""),
  channel: String(row.channel ?? ""),
  message: String(row.message ?? ""),
  status: (row.status as "new" | "approved" | "rejected") ?? "new",
  adminNote: String(row.admin_note ?? row.adminNote ?? ""),
  createdAt: String(row.created_at ?? row.createdAt ?? ""),
  updatedAt: String(row.updated_at ?? row.updatedAt ?? ""),
});

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("affiliate_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map((row) => toClient(row as Record<string, unknown>)));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!name || !email) {
    return NextResponse.json(
      { ok: false, error: "Ad soyad ve e-posta zorunludur." },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const row = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    email,
    phone: typeof body.phone === "string" ? body.phone.trim() : "",
    city: typeof body.city === "string" ? body.city.trim() : "",
    instagram: typeof body.instagram === "string" ? body.instagram.trim() : "",
    website: typeof body.website === "string" ? body.website.trim() : "",
    channel: typeof body.channel === "string" ? body.channel.trim() : "",
    message: typeof body.message === "string" ? body.message.trim() : "",
    status: "new",
    admin_note: "",
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabaseAdmin
    .from("affiliate_leads")
    .insert(row)
    .select("*")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, lead: toClient(data as Record<string, unknown>) }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "ID zorunlu." }, { status: 400 });
  }

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.status === "approved" || body.status === "rejected" || body.status === "new") {
    update.status = body.status;
  }
  if (typeof body.adminNote === "string") update.admin_note = body.adminNote.trim();

  const { error } = await supabaseAdmin.from("affiliate_leads").update(update).eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "ID zorunlu." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("affiliate_leads").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
