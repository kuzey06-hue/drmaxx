import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const FILE = path.join(process.cwd(), "data", "cms", "pazaryeri.json");

async function read() {
  try { return JSON.parse(await fs.readFile(FILE, "utf-8")); }
  catch { return {}; }
}
async function write(data: unknown) {
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const data = await read();
  // API Secret'ları gizle
  const safe = JSON.parse(JSON.stringify(data));
  for (const key of Object.keys(safe)) {
    if (safe[key].apiSecret) safe[key].apiSecret = safe[key].apiSecret ? "••••••••" : "";
    if (safe[key].password)  safe[key].password  = safe[key].password  ? "••••••••" : "";
  }
  return NextResponse.json(safe);
}

export async function PUT(req: NextRequest) {
  const body = await req.json(); // { marketplace: "trendyol", ...fields }
  const { marketplace, ...fields } = body;
  const data = await read();

  // Gizlenmiş alanları korur (frontend •••• gönderirse değiştirme)
  const current = data[marketplace] ?? {};
  const updated: Record<string, unknown> = { ...current };
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === "string" && /^•+$/.test(v)) continue; // gizlenmiş, dokunma
    updated[k] = v;
  }

  data[marketplace] = updated;
  await write(data);
  return NextResponse.json({ ok: true });
}
