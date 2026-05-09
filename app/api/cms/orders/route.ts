import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const FILE = path.join(process.cwd(), "data", "cms", "orders.json");

async function read() {
  try { return JSON.parse(await fs.readFile(FILE, "utf-8")); }
  catch { return []; }
}
async function write(data: unknown) {
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), "utf-8");
}

// GET /api/cms/orders
export async function GET() {
  const orders = await read();
  // En yeni sipariş önce
  return NextResponse.json(orders.sort((a: { date: string }, b: { date: string }) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ));
}

// POST /api/cms/orders — yeni sipariş oluştur
export async function POST(req: NextRequest) {
  const body = await req.json();
  const orders = await read();

  // Sipariş numarası üret: DRM-2026-XXXXX
  const year = new Date().getFullYear();
  const seq = String(orders.length + 1).padStart(4, "0");
  const orderNo = body.orderNo || `DRM-${year}-${seq}`;

  const newOrder = {
    ...body,
    id: `o${Date.now()}`,
    orderNo,
    date: new Date().toISOString().split("T")[0],
    status: body.status || "Beklemede",
  };

  await write([newOrder, ...orders]);
  return NextResponse.json(newOrder, { status: 201 });
}

// PUT /api/cms/orders — durum güncelle
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const orders = await read();
  const updated = orders.map((o: { id: string }) =>
    o.id === body.id ? { ...o, ...body } : o
  );
  await write(updated);
  return NextResponse.json({ ok: true });
}

// PUT ile orderNo üzerinden de güncelleme — PayTR callback için
export async function PATCH(req: NextRequest) {
  const { orderNo, status, paymentType } = await req.json();
  const orders = await read();
  const updated = orders.map((o: { orderNo: string }) =>
    o.orderNo === orderNo ? { ...o, status, paymentMethod: paymentType || o } : o
  );
  await write(updated);
  return NextResponse.json({ ok: true });
}

// DELETE /api/cms/orders?id=xxx
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  const orders = await read();
  await write(orders.filter((o: { id: string }) => o.id !== id));
  return NextResponse.json({ ok: true });
}
