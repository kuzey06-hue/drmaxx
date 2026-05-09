/**
 * POST /api/pazaryeri/sync
 * body: { marketplace: "trendyol" | "hepsiburada" | "n11" }
 *
 * Her pazaryerinden yeni siparişleri çeker, local orders.json'a ekler.
 * Zaten içe aktarılmış siparişleri (sourceOrderId) tekrar eklemez.
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "data", "cms", "pazaryeri.json");
const ORDERS_FILE   = path.join(process.cwd(), "data", "cms", "orders.json");

async function readSettings() {
  try { return JSON.parse(await fs.readFile(SETTINGS_FILE, "utf-8")); }
  catch { return {}; }
}
async function readOrders() {
  try { return JSON.parse(await fs.readFile(ORDERS_FILE, "utf-8")); }
  catch { return []; }
}
async function writeOrders(data: unknown[]) {
  await fs.writeFile(ORDERS_FILE, JSON.stringify(data, null, 2), "utf-8");
}
async function writeSettings(data: unknown) {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ── Trendyol ─────────────────────────────────────────────────────────────────
async function syncTrendyol(cfg: { supplierId: string; apiKey: string; apiSecret: string }) {
  const auth = Buffer.from(`${cfg.apiKey}:${cfg.apiSecret}`).toString("base64");
  const url = `https://api.trendyol.com/sapigw/suppliers/${cfg.supplierId}/orders?status=Created&size=200&orderByField=PackageLastModifiedDate&orderByDirection=DESC`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      "User-Agent":  `${cfg.supplierId} - SelfIntegration`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Trendyol API ${res.status}: ${txt.slice(0, 200)}`);
  }

  const json = await res.json();
  const orders = (json.content ?? []) as TrendyolOrder[];

  return orders.map((o): ImportedOrder => ({
    sourceOrderId:  String(o.orderNumber),
    source:         "Trendyol",
    customer:       `${o.shipmentAddress?.fullName ?? o.customerFirstName + " " + o.customerLastName}`,
    email:          o.shipmentAddress?.email ?? "",
    phone:          o.shipmentAddress?.phone ?? "",
    address:        `${o.shipmentAddress?.address1 ?? ""}, ${o.shipmentAddress?.district ?? ""} / ${o.shipmentAddress?.city ?? ""}`,
    items:          (o.lines ?? []).map(l => ({
      productId:   l.barcode ?? "",
      productName: l.productName,
      quantity:    l.quantity,
      price:       l.price,
    })),
    total:          o.totalPrice,
    date:           new Date(o.orderDate).toISOString().split("T")[0],
    paymentMethod: "Trendyol",
    status:        "Beklemede",
  }));
}

// ── Hepsiburada ───────────────────────────────────────────────────────────────
async function syncHepsiburada(cfg: { merchantId: string; username: string; password: string }) {
  const auth = Buffer.from(`${cfg.username}:${cfg.password}`).toString("base64");
  const url  = `https://mpop.hepsiburada.com/order/merchantid/${cfg.merchantId}/neworders/all?offset=0&limit=100`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Hepsiburada API ${res.status}: ${txt.slice(0, 200)}`);
  }

  const json = await res.json();
  const orders = (json.data ?? []) as HepsiburadaOrder[];

  return orders.map((o): ImportedOrder => ({
    sourceOrderId:  String(o.id),
    source:         "Hepsiburada",
    customer:       o.customer?.name ?? "Bilinmiyor",
    email:          o.customer?.email ?? "",
    phone:          o.customer?.phoneNumber ?? "",
    address:        o.shippingAddress?.addressText ?? "",
    items:          (o.lines ?? []).map(l => ({
      productId:   l.merchantSku ?? "",
      productName: l.productName,
      quantity:    l.quantity,
      price:       l.price,
    })),
    total:          o.totalPrice,
    date:           (o.orderDate ?? new Date().toISOString()).split("T")[0],
    paymentMethod: "Hepsiburada",
    status:        "Beklemede",
  }));
}

// ── n11 ───────────────────────────────────────────────────────────────────────
async function syncN11(cfg: { apiKey: string; apiSecret: string }) {
  // n11 REST API v2
  const auth = Buffer.from(`${cfg.apiKey}:${cfg.apiSecret}`).toString("base64");
  const url  = "https://api.n11.com/ws/orderService/getOrderList?status=New&pageSize=100&currentPage=0";

  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`n11 API ${res.status}: ${txt.slice(0, 200)}`);
  }

  const json = await res.json();
  const orders = (json.orderList?.order ?? []) as N11Order[];

  return orders.map((o): ImportedOrder => ({
    sourceOrderId:  String(o.id),
    source:         "n11",
    customer:       `${o.buyerName ?? ""}`.trim() || "Bilinmiyor",
    email:          o.buyerEmail ?? "",
    phone:          o.buyerPhone ?? "",
    address:        o.deliveryAddress?.address ?? "",
    items:          (o.orderItemList?.orderItem ?? []).map((l: N11OrderItem) => ({
      productId:   l.productSellerCode ?? "",
      productName: l.productName,
      quantity:    l.quantity,
      price:       l.unitPrice,
    })),
    total:          o.totalAmount,
    date:           (o.createDate ?? new Date().toISOString()).split(" ")[0],
    paymentMethod: "n11",
    status:        "Beklemede",
  }));
}

// ── Ana handler ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { marketplace } = await req.json();
  const settings = await readSettings();
  const cfg = settings[marketplace];

  if (!cfg?.active) {
    return NextResponse.json({ ok: false, error: `${marketplace} entegrasyonu aktif değil.` }, { status: 400 });
  }

  try {
    let imported: ImportedOrder[] = [];

    if (marketplace === "trendyol") {
      if (!cfg.supplierId || !cfg.apiKey || !cfg.apiSecret)
        return NextResponse.json({ ok: false, error: "Trendyol kimlik bilgileri eksik." }, { status: 400 });
      imported = await syncTrendyol(cfg);
    } else if (marketplace === "hepsiburada") {
      if (!cfg.merchantId || !cfg.username || !cfg.password)
        return NextResponse.json({ ok: false, error: "Hepsiburada kimlik bilgileri eksik." }, { status: 400 });
      imported = await syncHepsiburada(cfg);
    } else if (marketplace === "n11") {
      if (!cfg.apiKey || !cfg.apiSecret)
        return NextResponse.json({ ok: false, error: "n11 kimlik bilgileri eksik." }, { status: 400 });
      imported = await syncN11(cfg);
    } else {
      return NextResponse.json({ ok: false, error: "Bilinmeyen pazaryeri." }, { status: 400 });
    }

    // Mevcut siparişler
    const existingOrders = await readOrders();
    const existingIds = new Set(existingOrders.map((o: { sourceOrderId?: string }) => o.sourceOrderId).filter(Boolean));

    // Yeni olanları filtrele
    const newOrders = imported.filter(o => !existingIds.has(o.sourceOrderId));

    // Sipariş numarası üret
    const year = new Date().getFullYear();
    const marketCode = marketplace === "trendyol" ? "TY" : marketplace === "hepsiburada" ? "HB" : "N11";
    const withNums = newOrders.map((o, i) => ({
      ...o,
      id:      `${marketplace}_${o.sourceOrderId}`,
      orderNo: `DRM-${marketCode}-${year}-${String(existingOrders.length + i + 1).padStart(4, "0")}`,
    }));

    if (withNums.length > 0) {
      await writeOrders([...withNums, ...existingOrders]);
    }

    // lastSync güncelle
    settings[marketplace].lastSync = new Date().toISOString();
    settings[marketplace].syncCount = (settings[marketplace].syncCount ?? 0) + newOrders.length;
    await writeSettings(settings);

    return NextResponse.json({
      ok:       true,
      imported: newOrders.length,
      skipped:  imported.length - newOrders.length,
      total:    imported.length,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// ── Stok / Fiyat güncelleme (Trendyol) ───────────────────────────────────────
export async function PUT(req: NextRequest) {
  const { marketplace, items } = await req.json();
  // items: [{ barcode, quantity, salePrice, listPrice }]
  const settings = await readSettings();
  const cfg = settings[marketplace];

  if (marketplace !== "trendyol" || !cfg?.active) {
    return NextResponse.json({ ok: false, error: "Yalnızca aktif Trendyol entegrasyonu desteklenir." }, { status: 400 });
  }

  const auth = Buffer.from(`${cfg.apiKey}:${cfg.apiSecret}`).toString("base64");
  const url  = `https://api.trendyol.com/sapigw/suppliers/${cfg.supplierId}/products/price-and-inventory`;

  const res = await fetch(url, {
    method:  "PUT",
    headers: {
      Authorization:  `Basic ${auth}`,
      "User-Agent":   `${cfg.supplierId} - SelfIntegration`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    const txt = await res.text();
    return NextResponse.json({ ok: false, error: `Trendyol ${res.status}: ${txt.slice(0, 200)}` }, { status: 500 });
  }

  const json = await res.json();
  return NextResponse.json({ ok: true, batchRequestId: json.batchRequestId });
}

// ── Tip tanımları ─────────────────────────────────────────────────────────────
interface ImportedOrder {
  sourceOrderId: string; source: string; customer: string;
  email: string; phone: string; address: string;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  total: number; date: string; paymentMethod: string; status: string;
}

interface TrendyolOrder {
  orderNumber: string | number; customerFirstName: string; customerLastName: string;
  totalPrice: number; orderDate: number; status: string;
  shipmentAddress?: { fullName?: string; email?: string; address1?: string; district?: string; city?: string; phone?: string };
  lines?: { barcode?: string; productName: string; quantity: number; price: number; amount: number }[];
}
interface HepsiburadaOrder {
  id: string | number; totalPrice: number; orderDate?: string;
  customer?: { name?: string; email?: string; phoneNumber?: string };
  shippingAddress?: { addressText?: string };
  lines?: { merchantSku?: string; productName: string; quantity: number; price: number }[];
}
interface N11OrderItem { productSellerCode?: string; productName: string; quantity: number; unitPrice: number; }
interface N11Order {
  id: string | number; totalAmount: number; createDate?: string;
  buyerName?: string; buyerEmail?: string; buyerPhone?: string;
  deliveryAddress?: { address?: string };
  orderItemList?: { orderItem?: N11OrderItem[] };
}
