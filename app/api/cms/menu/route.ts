import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const FILE = path.join(process.cwd(), "data", "cms", "menu.json");

async function read() {
  try { return JSON.parse(await fs.readFile(FILE, "utf-8")); }
  catch { return []; }
}
async function write(data: unknown) {
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  return NextResponse.json(await read());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = await read();
  const newItem = { ...body, id: Date.now(), order: items.length + 1 };
  await write([...items, newItem]);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const items = await read();
  // Supports both single update and full reorder (array)
  if (Array.isArray(body)) {
    await write(body);
  } else {
    const updated = items.map((i: { id: number }) => i.id === body.id ? { ...i, ...body } : i);
    await write(updated);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = Number(new URL(req.url).searchParams.get("id"));
  const items = await read();
  await write(items.filter((i: { id: number }) => i.id !== id));
  return NextResponse.json({ ok: true });
}
