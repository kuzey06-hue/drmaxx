import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const FILE = path.join(process.cwd(), "data", "cms", "kuponlar.json");

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

async function read(): Promise<Kupon[]> {
  try { return JSON.parse(await fs.readFile(FILE, "utf-8")); }
  catch { return []; }
}
async function write(data: Kupon[]) {
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  return NextResponse.json(await read());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const list = await read();

  // Aynı kod zaten var mı?
  if (list.some(k => k.code.toUpperCase() === body.code?.toUpperCase())) {
    return NextResponse.json({ error: "Bu kupon kodu zaten kullanılıyor." }, { status: 400 });
  }

  const kupon: Kupon = {
    id: String(Date.now()),
    code: (body.code as string).toUpperCase().trim(),
    type: body.type ?? "percent",
    value: Number(body.value) || 0,
    minOrder: Number(body.minOrder) || 0,
    maxUses: body.maxUses ? Number(body.maxUses) : null,
    usedCount: 0,
    expiresAt: body.expiresAt || null,
    active: body.active ?? true,
    description: body.description ?? "",
    createdAt: new Date().toISOString().split("T")[0],
  };

  await write([...list, kupon]);
  return NextResponse.json(kupon, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const list = await read();
  const updated = list.map(k => k.id === body.id ? { ...k, ...body } : k);
  await write(updated);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  const list = await read();
  await write(list.filter(k => k.id !== id));
  return NextResponse.json({ ok: true });
}
