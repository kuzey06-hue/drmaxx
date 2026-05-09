import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/cms/kuponlar/validate
export async function POST(req: NextRequest) {
  const { code, orderTotal } = await req.json();
  if (!code) return NextResponse.json({ ok: false, error: "Kupon kodu giriniz." });

  const { data: row } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("code", (code as string).toUpperCase().trim())
    .single();

  if (!row) return NextResponse.json({ ok: false, error: "Geçersiz kupon kodu." });
  if (!row.active) return NextResponse.json({ ok: false, error: "Bu kupon artık aktif değil." });
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ ok: false, error: "Bu kuponun süresi dolmuş." });
  }
  if (row.max_uses !== null && row.used_count >= row.max_uses) {
    return NextResponse.json({ ok: false, error: "Bu kuponun kullanım limiti dolmuş." });
  }
  if (orderTotal < row.min_order) {
    return NextResponse.json({
      ok: false,
      error: `Bu kupon en az ₺${(row.min_order as number).toLocaleString("tr-TR")} tutarındaki siparişlerde geçerlidir.`,
    });
  }

  const discount = row.type === "percent"
    ? Math.round((orderTotal * (row.value as number)) / 100 * 100) / 100
    : Math.min(row.value as number, orderTotal);

  const kupon = {
    id: row.id, code: row.code, type: row.type, value: row.value,
    minOrder: row.min_order, maxUses: row.max_uses, usedCount: row.used_count,
    expiresAt: row.expires_at, active: row.active, description: row.description,
  };

  return NextResponse.json({ ok: true, kupon, discount });
}

// PATCH — kullanım sayısını artır
export async function PATCH(req: NextRequest) {
  const { code } = await req.json();
  const { data: row } = await supabaseAdmin
    .from("coupons")
    .select("used_count")
    .eq("code", (code as string).toUpperCase().trim())
    .single();

  if (row) {
    await supabaseAdmin
      .from("coupons")
      .update({ used_count: (row.used_count as number) + 1 })
      .eq("code", (code as string).toUpperCase().trim());
  }
  return NextResponse.json({ ok: true });
}
