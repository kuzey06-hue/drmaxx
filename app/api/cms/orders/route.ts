import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

// GET /api/cms/orders
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/cms/orders
export async function POST(req: NextRequest) {
  const body = await req.json();
  const orderNo = body.orderNo || `DM-${Date.now()}`;
  const newOrder = {
    id: `o${Date.now()}`,
    order_no: orderNo,
    customer: body.customer,
    email: body.email,
    phone: body.phone,
    address: body.address,
    invoice_type: body.invoiceType ?? "bireysel",
    tc_kimlik: body.tcKimlik ?? null,
    vergi_no: body.vergiNo ?? null,
    vergi_dairesi: body.vergiDairesi ?? null,
    firma_adi: body.firmaAdi ?? null,
    items: body.items ?? [],
    total: body.total ?? 0,
    status: body.status ?? "Beklemede",
    payment_method: body.paymentMethod ?? null,
    kupon_kod: body.kuponKod ?? null,
    indirim: body.indirim ?? 0,
    date: new Date().toISOString().split("T")[0],
  };
  const { data, error } = await supabaseAdmin.from("orders").insert(newOrder).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ...data, orderNo: (data as Record<string, unknown>).order_no }, { status: 201 });
}

// PUT /api/cms/orders
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...rest } = body;
  const { error } = await supabaseAdmin.from("orders").update(rest).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// PATCH /api/cms/orders — PayTR callback
export async function PATCH(req: NextRequest) {
  const { orderNo, status, paymentType } = await req.json();
  const update: Record<string, string> = { status };
  if (paymentType) update.payment_method = paymentType;
  const { error } = await supabaseAdmin.from("orders").update(update).eq("order_no", orderNo);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/cms/orders?id=xxx
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  const { error } = await supabaseAdmin.from("orders").delete().eq("id", id!);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
