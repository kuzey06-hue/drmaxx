import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

function toClient(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: row.price,
    originalPrice: row.original_price ?? null,
    rating: row.rating,
    reviewCount: row.review_count,
    badge: row.badge ?? null,
    quantity: row.quantity,
    category: row.category,
    description: row.description,
    color: row.color,
    image: row.image,
    stock: row.stock,
    active: row.active,
  };
}

function toDb(body: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  if (body.name        !== undefined) row.name           = body.name;
  if (body.slug        !== undefined) row.slug           = body.slug;
  if (body.price       !== undefined) row.price          = body.price;
  if ("originalPrice"  in body)       row.original_price = body.originalPrice ?? null;
  if (body.rating      !== undefined) row.rating         = body.rating;
  if (body.reviewCount !== undefined) row.review_count   = body.reviewCount;
  if ("badge"          in body)       row.badge          = body.badge ?? null;
  if (body.quantity    !== undefined) row.quantity       = body.quantity;
  if (body.category    !== undefined) row.category       = body.category;
  if (body.description !== undefined) row.description    = body.description;
  if (body.color       !== undefined) row.color          = body.color;
  if (body.image       !== undefined) row.image          = body.image;
  if (body.stock       !== undefined) row.stock          = body.stock;
  if (body.active      !== undefined) row.active         = body.active;
  return row;
}

// GET /api/cms/products
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data as Record<string, unknown>[]).map(toClient));
}

// POST /api/cms/products
export async function POST(req: NextRequest) {
  const body = await req.json();
  const slug = body.slug || body.name.toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const row = { id: body.id || String(Date.now()), slug, ...toDb(body) };
  const { data, error } = await supabaseAdmin.from("products").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toClient(data as Record<string, unknown>), { status: 201 });
}

// PUT /api/cms/products
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...rest } = body;
  const row = toDb(rest);
  const { error } = await supabaseAdmin.from("products").update(row).eq("id", String(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/cms/products?id=xxx
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id!);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
