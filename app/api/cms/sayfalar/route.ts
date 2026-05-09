import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const FILE = path.join(process.cwd(), "data", "cms", "sayfalar.json");

async function read() {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function write(data: unknown) {
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const pages = await read();
  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const pages = await read();
  const newPage = {
    ...body,
    id: Date.now(),
    updated: new Date().toISOString().split("T")[0],
  };
  await write([...pages, newPage]);
  return NextResponse.json(newPage, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const pages = await read();
  const updated = pages.map((p: { id: number }) =>
    p.id === body.id
      ? { ...p, ...body, updated: new Date().toISOString().split("T")[0] }
      : p
  );
  await write(updated);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  const pages = await read();
  await write(pages.filter((p: { id: number }) => p.id !== id));
  return NextResponse.json({ ok: true });
}
