import { NextRequest, NextResponse } from "next/server";
import { readCmsContent, writeCmsContent } from "@/lib/cmsStore";
import { supabaseAdmin } from "@/lib/supabase";

const CMS_KEY = "marketplace_settings";

type MarketplaceKey = "trendyol" | "hepsiburada" | "n11";

type MarketplaceCfg = {
  active?: boolean;
  supplierId?: string;
  apiKey?: string;
  apiSecret?: string;
  merchantId?: string;
  username?: string;
  password?: string;
  lastSync?: string | null;
  syncCount?: number;
};

type SettingsMap = Record<MarketplaceKey, MarketplaceCfg>;

interface ImportedOrder {
  sourceOrderId: string;
  source: "Trendyol" | "Hepsiburada" | "n11";
  customer: string;
  email: string;
  phone: string;
  address: string;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  total: number;
  date: string;
  status: string;
}

interface TrendyolOrder {
  orderNumber: string | number;
  customerFirstName: string;
  customerLastName: string;
  totalPrice: number;
  orderDate: number;
  shipmentAddress?: {
    fullName?: string;
    email?: string;
    address1?: string;
    district?: string;
    city?: string;
    phone?: string;
  };
  lines?: { barcode?: string; productName: string; quantity: number; price: number }[];
}

interface HepsiburadaOrder {
  id: string | number;
  totalPrice: number;
  orderDate?: string;
  customer?: { name?: string; email?: string; phoneNumber?: string };
  shippingAddress?: { addressText?: string };
  lines?: { merchantSku?: string; productName: string; quantity: number; price: number }[];
}

interface N11OrderItem {
  productSellerCode?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface N11Order {
  id: string | number;
  totalAmount: number;
  createDate?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  deliveryAddress?: { address?: string };
  orderItemList?: { orderItem?: N11OrderItem[] };
}

async function readSettings(): Promise<SettingsMap> {
  const raw = await readCmsContent<Partial<SettingsMap>>(CMS_KEY, {});
  return {
    trendyol: raw.trendyol ?? {},
    hepsiburada: raw.hepsiburada ?? {},
    n11: raw.n11 ?? {},
  };
}

async function writeSettings(settings: SettingsMap) {
  await writeCmsContent(CMS_KEY, settings);
}

async function syncTrendyol(cfg: Required<Pick<MarketplaceCfg, "supplierId" | "apiKey" | "apiSecret">>) {
  const auth = Buffer.from(`${cfg.apiKey}:${cfg.apiSecret}`).toString("base64");
  const url = `https://api.trendyol.com/sapigw/suppliers/${cfg.supplierId}/orders?status=Created&size=200&orderByField=PackageLastModifiedDate&orderByDirection=DESC`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      "User-Agent": `${cfg.supplierId} - SelfIntegration`,
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
    sourceOrderId: String(o.orderNumber),
    source: "Trendyol",
    customer: `${o.shipmentAddress?.fullName ?? `${o.customerFirstName} ${o.customerLastName}`}`.trim(),
    email: o.shipmentAddress?.email ?? "",
    phone: o.shipmentAddress?.phone ?? "",
    address: `${o.shipmentAddress?.address1 ?? ""}, ${o.shipmentAddress?.district ?? ""} / ${o.shipmentAddress?.city ?? ""}`
      .replace(/^,\s*/, "")
      .trim(),
    items: (o.lines ?? []).map((l) => ({
      productId: l.barcode ?? "",
      productName: l.productName,
      quantity: l.quantity,
      price: l.price,
    })),
    total: o.totalPrice,
    date: new Date(o.orderDate).toISOString().split("T")[0],
    status: "Beklemede",
  }));
}

async function syncHepsiburada(cfg: Required<Pick<MarketplaceCfg, "merchantId" | "username" | "password">>) {
  const auth = Buffer.from(`${cfg.username}:${cfg.password}`).toString("base64");
  const url = `https://mpop.hepsiburada.com/order/merchantid/${cfg.merchantId}/neworders/all?offset=0&limit=100`;

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
    sourceOrderId: String(o.id),
    source: "Hepsiburada",
    customer: o.customer?.name ?? "Bilinmiyor",
    email: o.customer?.email ?? "",
    phone: o.customer?.phoneNumber ?? "",
    address: o.shippingAddress?.addressText ?? "",
    items: (o.lines ?? []).map((l) => ({
      productId: l.merchantSku ?? "",
      productName: l.productName,
      quantity: l.quantity,
      price: l.price,
    })),
    total: o.totalPrice,
    date: (o.orderDate ?? new Date().toISOString()).split("T")[0],
    status: "Beklemede",
  }));
}

async function syncN11(cfg: Required<Pick<MarketplaceCfg, "apiKey" | "apiSecret">>) {
  const auth = Buffer.from(`${cfg.apiKey}:${cfg.apiSecret}`).toString("base64");
  const url = "https://api.n11.com/ws/orderService/getOrderList?status=New&pageSize=100&currentPage=0";

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
    sourceOrderId: String(o.id),
    source: "n11",
    customer: `${o.buyerName ?? ""}`.trim() || "Bilinmiyor",
    email: o.buyerEmail ?? "",
    phone: o.buyerPhone ?? "",
    address: o.deliveryAddress?.address ?? "",
    items: (o.orderItemList?.orderItem ?? []).map((l) => ({
      productId: l.productSellerCode ?? "",
      productName: l.productName,
      quantity: l.quantity,
      price: l.unitPrice,
    })),
    total: o.totalAmount,
    date: (o.createDate ?? new Date().toISOString()).split(" ")[0],
    status: "Beklemede",
  }));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const marketplace = String(body?.marketplace ?? "") as MarketplaceKey;
  if (!["trendyol", "hepsiburada", "n11"].includes(marketplace)) {
    return NextResponse.json({ ok: false, error: "Bilinmeyen pazaryeri." }, { status: 400 });
  }

  const settings = await readSettings();
  const cfg = settings[marketplace] ?? {};
  if (!cfg.active) {
    return NextResponse.json(
      { ok: false, error: `${marketplace} entegrasyonu aktif değil.` },
      { status: 400 },
    );
  }

  try {
    let imported: ImportedOrder[] = [];

    if (marketplace === "trendyol") {
      if (!cfg.supplierId || !cfg.apiKey || !cfg.apiSecret) {
        return NextResponse.json({ ok: false, error: "Trendyol kimlik bilgileri eksik." }, { status: 400 });
      }
      imported = await syncTrendyol({
        supplierId: cfg.supplierId,
        apiKey: cfg.apiKey,
        apiSecret: cfg.apiSecret,
      });
    } else if (marketplace === "hepsiburada") {
      if (!cfg.merchantId || !cfg.username || !cfg.password) {
        return NextResponse.json({ ok: false, error: "Hepsiburada kimlik bilgileri eksik." }, { status: 400 });
      }
      imported = await syncHepsiburada({
        merchantId: cfg.merchantId,
        username: cfg.username,
        password: cfg.password,
      });
    } else {
      if (!cfg.apiKey || !cfg.apiSecret) {
        return NextResponse.json({ ok: false, error: "n11 kimlik bilgileri eksik." }, { status: 400 });
      }
      imported = await syncN11({
        apiKey: cfg.apiKey,
        apiSecret: cfg.apiSecret,
      });
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("orders")
      .select("id, order_no");

    if (existingError) {
      return NextResponse.json({ ok: false, error: existingError.message }, { status: 500 });
    }

    const existingIds = new Set((existing ?? []).map((row) => String(row.id ?? "")));
    const existingOrderNos = new Set((existing ?? []).map((row) => String(row.order_no ?? "")));

    const newOrders = imported.filter((o) => !existingIds.has(`${marketplace}_${o.sourceOrderId}`));
    const year = new Date().getFullYear();
    const marketCode = marketplace === "trendyol" ? "TY" : marketplace === "hepsiburada" ? "HB" : "N11";

    let seq = (existing ?? []).length + 1;
    const rows = newOrders.map((o) => {
      let orderNo = `DRM-${marketCode}-${year}-${String(seq).padStart(4, "0")}`;
      while (existingOrderNos.has(orderNo)) {
        seq += 1;
        orderNo = `DRM-${marketCode}-${year}-${String(seq).padStart(4, "0")}`;
      }
      seq += 1;
      existingOrderNos.add(orderNo);

      return {
        id: `${marketplace}_${o.sourceOrderId}`,
        order_no: orderNo,
        source: o.source,
        source_order_id: o.sourceOrderId,
        customer: o.customer,
        email: o.email,
        phone: o.phone,
        address: o.address,
        items: o.items,
        total: o.total,
        status: o.status,
        date: o.date,
        payment_method: o.source,
        invoice_type: "bireysel",
        tc_kimlik: null,
        vergi_no: null,
        vergi_dairesi: null,
        firma_adi: null,
        kupon_kod: null,
        indirim: 0,
      };
    });

    if (rows.length) {
      const { error: insertError } = await supabaseAdmin.from("orders").insert(rows);
      if (insertError) {
        const fallbackRows = rows.map(({ source: _source, source_order_id: _soid, ...rest }) => rest);
        const needsFallback =
          /column .*source/i.test(insertError.message) ||
          /source_order_id/i.test(insertError.message);

        if (!needsFallback) {
          return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 });
        }

        const { error: fallbackError } = await supabaseAdmin.from("orders").insert(fallbackRows);
        if (fallbackError) {
          return NextResponse.json({ ok: false, error: fallbackError.message }, { status: 500 });
        }
      }
    }

    settings[marketplace] = {
      ...cfg,
      lastSync: new Date().toISOString(),
      syncCount: Number(cfg.syncCount ?? 0) + rows.length,
    };
    await writeSettings(settings);

    return NextResponse.json({
      ok: true,
      imported: rows.length,
      skipped: imported.length - rows.length,
      total: imported.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const marketplace = String(body?.marketplace ?? "") as MarketplaceKey;
  const items = Array.isArray(body?.items) ? body.items : [];

  if (marketplace !== "trendyol") {
    return NextResponse.json(
      { ok: false, error: "Yalnızca Trendyol entegrasyonu desteklenir." },
      { status: 400 },
    );
  }

  const settings = await readSettings();
  const cfg = settings.trendyol ?? {};
  if (!cfg.active || !cfg.supplierId || !cfg.apiKey || !cfg.apiSecret) {
    return NextResponse.json(
      { ok: false, error: "Aktif Trendyol kimlik bilgileri eksik." },
      { status: 400 },
    );
  }

  const auth = Buffer.from(`${cfg.apiKey}:${cfg.apiSecret}`).toString("base64");
  const url = `https://api.trendyol.com/sapigw/suppliers/${cfg.supplierId}/products/price-and-inventory`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${auth}`,
      "User-Agent": `${cfg.supplierId} - SelfIntegration`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    const txt = await res.text();
    return NextResponse.json(
      { ok: false, error: `Trendyol ${res.status}: ${txt.slice(0, 200)}` },
      { status: 500 },
    );
  }

  const json = await res.json();
  return NextResponse.json({ ok: true, batchRequestId: json.batchRequestId });
}
