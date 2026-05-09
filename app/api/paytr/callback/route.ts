import { NextRequest, NextResponse } from "next/server";
import { verifyPayTRCallback, PayTRConfig } from "@/lib/paytr";
import fs from "fs/promises";
import path from "path";

const ORDERS_FILE = path.join(process.cwd(), "data", "cms", "orders.json");

async function updateOrder(orderNo: string, status: string, paymentType?: string) {
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf-8");
    const orders = JSON.parse(raw);
    const updated = orders.map((o: { orderNo: string }) =>
      o.orderNo === orderNo
        ? { ...o, status, ...(paymentType ? { paymentMethod: paymentType } : {}) }
        : o
    );
    await fs.writeFile(ORDERS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (e) {
    console.error("[PayTR] Sipariş güncellenemedi:", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body: Record<string, string> = {};
    formData.forEach((value, key) => { body[key] = value.toString(); });

    const config: PayTRConfig = {
      merchant_id: process.env.PAYTR_MERCHANT_ID ?? "",
      merchant_key: process.env.PAYTR_MERCHANT_KEY ?? "",
      merchant_salt: process.env.PAYTR_MERCHANT_SALT ?? "",
    };

    verifyPayTRCallback(config, body, async ({ merchant_oid, status, total_amount, payment_type }) => {
      console.log("[PayTR Callback]", {
        merchant_oid,
        status,
        total_amount: `${(total_amount / 100).toFixed(2)} ₺`,
        payment_type,
      });

      if (status === "success") {
        await updateOrder(merchant_oid, "İşleniyor", payment_type);
      } else {
        await updateOrder(merchant_oid, "İptal");
      }
    });

    // PayTR "OK" döndürülmeli, aksi hâlde tekrar bildirim gönderir
    return new NextResponse("OK", { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Hata";
    console.error("[PayTR Callback Error]", message);
    return new NextResponse("OK", { status: 200 });
  }
}
