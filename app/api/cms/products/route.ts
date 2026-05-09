import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const FILE = path.join(process.cwd(), "data", "cms", "products.json");

async function read() {
  try { return JSON.parse(await fs.readFile(FILE, "utf-8")); }
  catch { return []; }
}
async function write(data: unknown) {
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), "utf-8");
}

// GET /api/cms/products
export async function GET() {
  const products = await read();
  return NextResponse.json(products);
}

// POST /api/cms/products — yeni ürün oluştur
export async function POST(req: NextRequest) {
  const body = await req.json();
  const products = await read();

  const newProduct = {
    ...body,
    id: String(Date.now()),
    slug: body.slug || body.name.toLowerCase()
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    stock: body.stock ?? 0,
    active: body.active ?? true,
    rating: body.rating ?? 5.0,
    reviewCount: body.reviewCount ?? 0,
  };

  await write([...products, newProduct]);
  return NextResponse.json(newProduct, { status: 201 });
}

// PUT /api/cms/products — güncelle
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const products = await read();
  const updated = products.map((p: { id: string }) =>
    p.id === body.id ? { ...p, ...body } : p
  );
  await write(updated);
  return NextResponse.json({ ok: true });
}

// DELETE /api/cms/products?id=xxx
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  const products = await read();
  await write(products.filter((p: { id: string }) => p.id !== id));
  return NextResponse.json({ ok: true });
}
