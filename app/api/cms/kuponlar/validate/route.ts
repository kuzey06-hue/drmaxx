import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { code, orderTotal } = await req.json();
    const normalized = typeof code === "string" ? code.toUpperCase().trim() : "";
    if (!normalized) {
      return NextResponse.json({ ok: false, error: "Kupon kodu giriniz." }, { status: 400 });
    }

    const { data: row, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", normalized)
      .maybeSingle();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    if (!row) return NextResponse.json({ ok: false, error: "Geçersiz kupon kodu." });
    if (!row.active) return NextResponse.json({ ok: false, error: "Bu kupon artık aktif değil." });
    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      return NextResponse.json({ ok: false, error: "Bu kuponun süresi dolmuş." });
    }
    if (row.max_uses !== null && row.used_count >= row.max_uses) {
      return NextResponse.json({ ok: false, error: "Bu kuponun kullanım limiti dolmuş." });
    }

    const numericOrderTotal = Number(orderTotal) || 0;
    if (numericOrderTotal < (row.min_order as number)) {
      return NextResponse.json({
        ok: false,
        error: `Bu kupon en az ₺${(row.min_order as number).toLocaleString("tr-TR")} tutarındaki siparişlerde geçerlidir.`,
      });
    }

    const discount =
      row.type === "percent"
        ? Math.round(((numericOrderTotal * (row.value as number)) / 100) * 100) / 100
        : Math.min(row.value as number, numericOrderTotal);

    const kupon = {
      id: row.id,
      code: row.code,
      type: row.type,
      value: row.value,
      minOrder: row.min_order,
      maxUses: row.max_uses,
      usedCount: row.used_count,
      expiresAt: row.expires_at,
      active: row.active,
      description: row.description,
      createdAt: row.created_at,
    };

    return NextResponse.json({ ok: true, kupon, discount });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kupon doğrulanamadı.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { code } = await req.json();
    const normalized = typeof code === "string" ? code.toUpperCase().trim() : "";
    if (!normalized) return NextResponse.json({ ok: false, error: "Kod zorunlu." }, { status: 400 });

    const { data: row, error } = await supabaseAdmin
      .from("coupons")
      .select("used_count")
      .eq("code", normalized)
      .maybeSingle();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    if (row) {
      const { error: updateError } = await supabaseAdmin
        .from("coupons")
        .update({ used_count: (row.used_count as number) + 1 })
        .eq("code", normalized);

      if (updateError) {
        return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kupon kullanım sayısı güncellenemedi.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
