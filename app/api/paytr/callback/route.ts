import { NextRequest, NextResponse } from "next/server";
import { verifyPayTRCallback, PayTRConfig } from "@/lib/paytr";
import { supabaseAdmin } from "@/lib/supabase";
import { createAdminNotification } from "@/lib/adminNotifications";

async function updateOrder(orderNo: string, status: "İşleniyor" | "İptal", paymentType?: string) {
  const update: Record<string, unknown> = { status };
  if (paymentType) update.payment_method = paymentType;

  await supabaseAdmin
    .from("orders")
    .update(update)
    .eq("order_no", orderNo);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      body[key] = value.toString();
    });

    const config: PayTRConfig = {
      merchant_id: process.env.PAYTR_MERCHANT_ID ?? "",
      merchant_key: process.env.PAYTR_MERCHANT_KEY ?? "",
      merchant_salt: process.env.PAYTR_MERCHANT_SALT ?? "",
    };

    verifyPayTRCallback(config, body, async ({ merchant_oid, status, payment_type }) => {
      if (status === "success") {
        await updateOrder(merchant_oid, "İşleniyor", payment_type);
      } else {
        await updateOrder(merchant_oid, "İptal");
        await createAdminNotification({
          type: "failed_payment",
          title: "Başarısız ödeme",
          message: `${merchant_oid} numaralı PayTR ödemesi başarısız oldu.`,
          href: "/admin/siparisler",
        }).catch(() => {});
      }
    });

    return new NextResponse("OK", { status: 200 });
  } catch {
    return new NextResponse("OK", { status: 200 });
  }
}
