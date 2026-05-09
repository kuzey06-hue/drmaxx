import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const FILE = path.join(process.cwd(), "data", "cms", "users.json");

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
  const users = await read();
  const newUser = { ...body, id: Date.now(), createdAt: new Date().toISOString().split("T")[0] };
  await write([...users, newUser]);
  return NextResponse.json(newUser, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const users = await read();
  const updated = users.map((u: { id: number }) => u.id === body.id ? { ...u, ...body } : u);
  await write(updated);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = Number(new URL(req.url).searchParams.get("id"));
  const users = await read();
  await write(users.filter((u: { id: number }) => u.id !== id));
  return NextResponse.json({ ok: true });
}
