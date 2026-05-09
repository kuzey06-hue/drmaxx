import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/cms/products
export async function GET() {
  const { data, error } = await supabase.from("products").select("*").order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/cms/products — yeni ürün
export async function POST(req: NextRequest) {
  const body = await req.json();
  const newProduct = {
    ...body,
    id: body.id || String(Date.now()),
    slug: body.slug || body.name.toLowerCase()
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    stock: body.stock ?? 0,
    active: body.active ?? true,
    rating: body.rating ?? 5.0,
    review_count: body.reviewCount ?? body.review_count ?? 0,
  };
  const { data, error } = await supabase.from("products").insert(newProduct).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PUT /api/cms/products — güncelle
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...rest } = body;
  const { error } = await supabase.from("products").update(rest).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/cms/products?id=xxx
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  const { error } = await supabase.from("products").delete().eq("id", id!);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
