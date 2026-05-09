/**
 * PayTR Entegrasyon Yardımcısı
 * node-paytr-master kütüphanesini kullanır
 */
const PayTR = require("../node-paytr-master/dist/index.js");

export interface PayTRConfig {
  merchant_id: string;
  merchant_key: string;
  merchant_salt: string;
  test_mode?: number;       // 1 = test, 0 = canlı
  debug_on?: number;        // 1 = debug aktif
  no_installment?: number;  // 1 = taksit yok
  max_installment?: number; // 0 = sınırsız
  timeout_limit?: number;   // dakika
  lang?: string;            // tr | en
}

export interface PayTROrderItem {
  name: string;
  price: string; // kuruş cinsinden string "29900"
  quantity: number;
}

export interface PayTRTransactionParams {
  user_ip: string;
  user_name: string;
  user_address: string;
  user_phone: string;
  email: string;
  merchant_oid: string;         // tekil sipariş no
  payment_amount: number;       // kuruş cinsinden (örn: 299.00 TL → 29900)
  currency: string;             // "TL"
  merchant_ok_url: string;
  merchant_fail_url: string;
  basket: PayTROrderItem[];
}

export async function getPayTRToken(
  config: PayTRConfig,
  transaction: PayTRTransactionParams
): Promise<{ status: "success" | "failed"; token?: string; reason?: string }> {
  const paytr = new PayTR({
    merchant_id: config.merchant_id,
    merchant_key: config.merchant_key,
    merchant_salt: config.merchant_salt,
    test_mode: config.test_mode ?? 1,
    debug_on: config.debug_on ?? 0,
    no_installment: config.no_installment ?? 0,
    max_installment: config.max_installment ?? 0,
    timeout_limit: config.timeout_limit ?? 30,
    lang: config.lang ?? "tr",
  });

  // user_basket: [[ad, fiyat(kuruş str), adet], ...]
  const user_basket = transaction.basket.map((item) => [
    item.name,
    item.price,
    item.quantity,
  ]);

  const result = await paytr.getToken({
    user_ip: transaction.user_ip,
    user_name: transaction.user_name,
    user_address: transaction.user_address,
    user_phone: transaction.user_phone,
    email: transaction.email,
    merchant_oid: transaction.merchant_oid,
    payment_amount: transaction.payment_amount,
    currency: transaction.currency,
    merchant_ok_url: transaction.merchant_ok_url,
    merchant_fail_url: transaction.merchant_fail_url,
    user_basket: [user_basket],
  });

  return result as { status: "success" | "failed"; token?: string; reason?: string };
}

export function verifyPayTRCallback(
  config: PayTRConfig,
  body: Record<string, string>,
  onSuccess: (data: {
    merchant_oid: string;
    status: string;
    total_amount: number;
    payment_type: string;
    currency?: string;
  }) => void
) {
  const paytr = new PayTR({
    merchant_id: config.merchant_id,
    merchant_key: config.merchant_key,
    merchant_salt: config.merchant_salt,
  });

  paytr.getPost(body, onSuccess);
}
