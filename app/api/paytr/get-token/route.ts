import { NextRequest, NextResponse } from "next/server";
import { getPayTRToken, PayTRConfig } from "@/lib/paytr";

/**
 * POST /api/paytr/get-token
 *
 * Body:
 * {
 *   user_name, user_address, user_phone, email,
 *   merchant_oid, payment_amount (kuruş),
 *   basket: [{ name, price, quantity }]
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const merchantOidRaw = String(body.merchant_oid ?? "");
    const merchantOid = merchantOidRaw.replace(/[^a-zA-Z0-9]/g, "") || `DM${Date.now()}`;

    // Merchant bilgileri — gerçek projede .env'den okunur
    const config: PayTRConfig = {
      merchant_id: process.env.PAYTR_MERCHANT_ID ?? "",
      merchant_key: process.env.PAYTR_MERCHANT_KEY ?? "",
      merchant_salt: process.env.PAYTR_MERCHANT_SALT ?? "",
      test_mode: process.env.PAYTR_TEST_MODE === "0" ? 0 : 1,
      debug_on: process.env.NODE_ENV === "development" ? 1 : 0,
      no_installment: 0,
      max_installment: 0,
      timeout_limit: 30,
      lang: "tr",
    };

    if (!config.merchant_id || !config.merchant_key || !config.merchant_salt) {
      return NextResponse.json(
        { status: "failed", reason: "PayTR kimlik bilgileri eksik. Lütfen .env dosyasını kontrol edin." },
        { status: 400 }
      );
    }

    // Kullanıcı IP adresini al
    const forwarded = req.headers.get("x-forwarded-for");
    const user_ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    const requestOrigin =
      req.headers.get("origin") ||
      `https://${req.headers.get("x-forwarded-host") || req.headers.get("host")}`;
    const baseUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXTAUTH_URL ||
      requestOrigin ||
      "https://drmaxx.vercel.app"
    ).replace(/\/+$/, "");

    const result = await getPayTRToken(config, {
      user_ip,
      user_name: body.user_name,
      user_address: body.user_address,
      user_phone: body.user_phone,
      email: body.email,
      merchant_oid: merchantOid,
      payment_amount: body.payment_amount,
      currency: "TL",
      merchant_ok_url: `${baseUrl}/odeme/basarili`,
      merchant_fail_url: `${baseUrl}/odeme/basarisiz`,
      basket: body.basket,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json(
      { status: "failed", reason: message },
      { status: 500 }
    );
  }
}
