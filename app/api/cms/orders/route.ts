import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createAdminNotification } from "@/lib/adminNotifications";
import { sendNewOrderEmail } from "@/lib/orderEmails";

type OrderStatus = "Beklemede" | "İşleniyor" | "Kargoda" | "Teslim Edildi" | "İptal";

type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

type ClientOrder = {
  id: string;
  orderNo: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  paymentMethod: string | null;
  invoiceType?: string;
  tcKimlik?: string;
  vergiNo?: string;
  vergiDairesi?: string;
  firmaAdi?: string;
  kuponKod?: string | null;
  indirim?: number;
  source?: string;
  sourceOrderId?: string;
};

const validStatuses: OrderStatus[] = ["Beklemede", "İşleniyor", "Kargoda", "Teslim Edildi", "İptal"];
const today = () => new Date().toISOString().split("T")[0];

const normalizeStatus = (value: unknown): OrderStatus => {
  const s = typeof value === "string" ? value : "Beklemede";
  return validStatuses.includes(s as OrderStatus) ? (s as OrderStatus) : "Beklemede";
};

const parseItems = (items: unknown): OrderItem[] => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      productId: String(row.productId ?? row.product_id ?? ""),
      productName: String(row.productName ?? row.product_name ?? ""),
      quantity: Number(row.quantity ?? 0),
      price: Number(row.price ?? 0),
    };
  });
};

const marketplaceSourceFrom = (value: unknown): string | undefined => {
  const raw = String(value ?? "");
  if (raw === "Trendyol" || raw === "Hepsiburada" || raw === "n11") return raw;
  return undefined;
};

const sourceOrderIdFromId = (value: unknown): string | undefined => {
  const id = String(value ?? "");
  if (!id.includes("_")) return undefined;
  const [prefix, ...rest] = id.split("_");
  if (!["trendyol", "hepsiburada", "n11"].includes(prefix) || !rest.length) return undefined;
  return rest.join("_");
};

const mapDbRowToClient = (row: Record<string, unknown>): ClientOrder => ({
  id: String(row.id ?? `o${Date.now()}`),
  orderNo: String(row.order_no ?? row.orderNo ?? `DM${Date.now()}`),
  customer: String(row.customer ?? ""),
  email: String(row.email ?? ""),
  phone: String(row.phone ?? ""),
  address: String(row.address ?? ""),
  items: parseItems(row.items),
  total: Number(row.total ?? 0),
  status: normalizeStatus(row.status),
  date: String(row.date ?? today()),
  paymentMethod:
    row.payment_method === null || row.paymentMethod === null
      ? null
      : String(row.payment_method ?? row.paymentMethod ?? ""),
  invoiceType: row.invoice_type ? String(row.invoice_type) : row.invoiceType ? String(row.invoiceType) : undefined,
  tcKimlik: row.tc_kimlik ? String(row.tc_kimlik) : row.tcKimlik ? String(row.tcKimlik) : undefined,
  vergiNo: row.vergi_no ? String(row.vergi_no) : row.vergiNo ? String(row.vergiNo) : undefined,
  vergiDairesi: row.vergi_dairesi
    ? String(row.vergi_dairesi)
    : row.vergiDairesi
      ? String(row.vergiDairesi)
      : undefined,
  firmaAdi: row.firma_adi ? String(row.firma_adi) : row.firmaAdi ? String(row.firmaAdi) : undefined,
  kuponKod: row.kupon_kod !== undefined ? (row.kupon_kod as string | null) : (row.kuponKod as string | null),
  indirim: row.indirim !== undefined ? Number(row.indirim ?? 0) : 0,
  source:
    marketplaceSourceFrom(row.source) ??
    marketplaceSourceFrom(row.payment_method) ??
    marketplaceSourceFrom(row.paymentMethod),
  sourceOrderId:
    row.source_order_id !== undefined
      ? String(row.source_order_id ?? "")
      : sourceOrderIdFromId(row.id),
});

const toDbInsert = (order: ClientOrder) => ({
  id: order.id,
  order_no: order.orderNo,
  customer: order.customer,
  email: order.email,
  phone: order.phone,
  address: order.address,
  invoice_type: order.invoiceType ?? "bireysel",
  tc_kimlik: order.tcKimlik ?? null,
  vergi_no: order.vergiNo ?? null,
  vergi_dairesi: order.vergiDairesi ?? null,
  firma_adi: order.firmaAdi ?? null,
  items: order.items,
  total: order.total,
  status: order.status,
  payment_method: order.paymentMethod,
  kupon_kod: order.kuponKod ?? null,
  indirim: order.indirim ?? 0,
  date: order.date,
});

const toDbUpdate = (payload: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  if (payload.orderNo !== undefined) out.order_no = payload.orderNo;
  if (payload.customer !== undefined) out.customer = payload.customer;
  if (payload.email !== undefined) out.email = payload.email;
  if (payload.phone !== undefined) out.phone = payload.phone;
  if (payload.address !== undefined) out.address = payload.address;
  if (payload.items !== undefined) out.items = payload.items;
  if (payload.total !== undefined) out.total = payload.total;
  if (payload.status !== undefined) out.status = normalizeStatus(payload.status);
  if (payload.paymentMethod !== undefined) out.payment_method = payload.paymentMethod;
  if (payload.invoiceType !== undefined) out.invoice_type = payload.invoiceType;
  if (payload.tcKimlik !== undefined) out.tc_kimlik = payload.tcKimlik;
  if (payload.vergiNo !== undefined) out.vergi_no = payload.vergiNo;
  if (payload.vergiDairesi !== undefined) out.vergi_dairesi = payload.vergiDairesi;
  if (payload.firmaAdi !== undefined) out.firma_adi = payload.firmaAdi;
  if (payload.kuponKod !== undefined) out.kupon_kod = payload.kuponKod;
  if (payload.indirim !== undefined) out.indirim = payload.indirim;
  if (payload.date !== undefined) out.date = payload.date;
  return out;
};

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map((row) => mapDbRowToClient(row as Record<string, unknown>)));
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const orderNo =
    typeof body.orderNo === "string" && body.orderNo.trim()
      ? body.orderNo.trim()
      : `DM${Date.now()}`;

  const clientOrder: ClientOrder = {
    id: String(body.id ?? `o${Date.now()}`),
    orderNo,
    customer: String(body.customer ?? ""),
    email: String(body.email ?? ""),
    phone: String(body.phone ?? ""),
    address: String(body.address ?? ""),
    items: parseItems(body.items),
    total: Number(body.total ?? 0),
    status: normalizeStatus(body.status),
    date: today(),
    paymentMethod: body.paymentMethod ? String(body.paymentMethod) : null,
    invoiceType: body.invoiceType ? String(body.invoiceType) : undefined,
    tcKimlik: body.tcKimlik ? String(body.tcKimlik) : undefined,
    vergiNo: body.vergiNo ? String(body.vergiNo) : undefined,
    vergiDairesi: body.vergiDairesi ? String(body.vergiDairesi) : undefined,
    firmaAdi: body.firmaAdi ? String(body.firmaAdi) : undefined,
    kuponKod: body.kuponKod ? String(body.kuponKod) : null,
    indirim: Number(body.indirim ?? 0),
  };

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert(toDbInsert(clientOrder))
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await createAdminNotification({
    type: "new_order",
    title: "Yeni sipariş",
    message: `${clientOrder.orderNo} - ${clientOrder.customer} - ₺${clientOrder.total.toLocaleString("tr-TR")}`,
    href: "/admin/siparisler",
  }).catch(() => {});

  await sendNewOrderEmail(clientOrder).catch((error) => {
    console.error("new_order_email_failed", error);
  });

  const productIds = clientOrder.items.map((item) => item.productId).filter(Boolean);
  if (productIds.length > 0) {
    const { data: lowStockProducts } = await supabaseAdmin
      .from("products")
      .select("id,name,stock")
      .in("id", productIds)
      .lte("stock", 10);

    for (const product of lowStockProducts ?? []) {
      await createAdminNotification({
        type: "low_stock",
        title: "Düşük stok uyarısı",
        message: `${product.name} stok: ${product.stock}`,
        href: "/admin/urunler",
      }).catch(() => {});
    }
  }

  return NextResponse.json(mapDbRowToClient(data as Record<string, unknown>), { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id zorunlu" }, { status: 400 });

  const { id: _id, ...rest } = body;
  const { error } = await supabaseAdmin
    .from("orders")
    .update(toDbUpdate(rest))
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const orderNo = typeof body.orderNo === "string" ? body.orderNo : "";
  const status = normalizeStatus(body.status);
  const paymentType = typeof body.paymentType === "string" ? body.paymentType : undefined;

  if (!orderNo) return NextResponse.json({ error: "orderNo zorunlu" }, { status: 400 });

  const update: Record<string, unknown> = { status };
  if (paymentType) update.payment_method = paymentType;

  const { error } = await supabaseAdmin
    .from("orders")
    .update(update)
    .eq("order_no", orderNo);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (status === "İptal") {
    await createAdminNotification({
      type: "failed_payment",
      title: "Başarısız ödeme",
      message: `${orderNo} numaralı sipariş başarısız/iptal olarak işaretlendi.`,
      href: "/admin/siparisler",
    }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "id zorunlu" }, { status: 400 });

  const { error } = await supabaseAdmin.from("orders").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}


