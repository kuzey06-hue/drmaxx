import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { Kupon } from "../route";

const FILE = path.join(process.cwd(), "data", "cms", "kuponlar.json");

async function read(): Promise<Kupon[]> {
  try { return JSON.parse(await fs.readFile(FILE, "utf-8")); }
  catch { return []; }
}
async function write(data: Kupon[]) {
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), "utf-8");
}

// POST /api/cms/kuponlar/validate
// body: { code, orderTotal }
// Geçerliyse: { ok: true, kupon, discount }
// Hatalıysa:  { ok: false, error }
export async function POST(req: NextRequest) {
  const { code, orderTotal } = await req.json();
  if (!code) return NextResponse.json({ ok: false, error: "Kupon kodu giriniz." });

  const list = await read();
  const kupon = list.find(k => k.code === (code as string).toUpperCase().trim());

  if (!kupon) return NextResponse.json({ ok: false, error: "Geçersiz kupon kodu." });
  if (!kupon.active) return NextResponse.json({ ok: false, error: "Bu kupon artık aktif değil." });
  if (kupon.expiresAt && new Date(kupon.expiresAt) < new Date()) {
    return NextResponse.json({ ok: false, error: "Bu kuponun süresi dolmuş." });
  }
  if (kupon.maxUses !== null && kupon.usedCount >= kupon.maxUses) {
    return NextResponse.json({ ok: false, error: "Bu kuponun kullanım limiti dolmuş." });
  }
  if (orderTotal < kupon.minOrder) {
    return NextResponse.json({
      ok: false,
      error: `Bu kupon en az ₺${kupon.minOrder.toLocaleString("tr-TR")} tutarındaki siparişlerde geçerlidir.`,
    });
  }

  const discount = kupon.type === "percent"
    ? Math.round((orderTotal * kupon.value) / 100 * 100) / 100
    : Math.min(kupon.value, orderTotal);

  return NextResponse.json({ ok: true, kupon, discount });
}

// PATCH /api/cms/kuponlar/validate — sipariş tamamlandığında kullanım sayısını artır
export async function PATCH(req: NextRequest) {
  const { code } = await req.json();
  const list = await read();
  const updated = list.map(k =>
    k.code === (code as string).toUpperCase().trim()
      ? { ...k, usedCount: k.usedCount + 1 }
      : k
  );
  await write(updated);
  return NextResponse.json({ ok: true });
}
