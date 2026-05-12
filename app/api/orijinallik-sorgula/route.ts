import { NextRequest, NextResponse } from "next/server";
import { getMergedProducts } from "@/lib/getProducts";
import { supabaseAdmin } from "@/lib/supabase";

const normalizeCode = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "");

type OriginalityRecord = {
  id: string;
  lisansKod: string;
  qrRawValue?: string;
  productName: string;
  productSlug: string;
  serialNo: string;
  batchNo: string;
  productionDate: string;
  expiryDate: string;
  soldToName: string;
  soldToCity: string;
  soldToPhone: string;
  soldAt: string;
  notes: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type VerifyProduct = {
  id: string;
  name: string;
  slug: string;
  barcode: string;
  approvalNo: string | null;
  batchNo: string | null;
  image: string | null;
  price: number | null;
};

const canonicalizeLink = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    const base = `${url.origin}${url.pathname}${url.search}`;
    return base.replace(/\/+$/, "");
  } catch {
    return trimmed;
  }
};

const extractLicenseCode = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    const keys = ["lisanskod", "lisansKod", "code", "kod", "license", "token", "id"];
    for (const key of keys) {
      const val = url.searchParams.get(key);
      if (val) return normalizeCode(val);
    }

    const pathParts = url.pathname.split("/").filter(Boolean).reverse();
    for (const part of pathParts) {
      const normalized = normalizeCode(decodeURIComponent(part));
      if (normalized.length >= 6) return normalized;
    }

    const whole = `${url.pathname}${url.search}`;
    const token = whole.match(/[A-Z0-9]{6,}/i)?.[0];
    if (token) return normalizeCode(token);
    return "";
  } catch {
    // not url
  }

  const matched = trimmed.match(/[?&]lisanskod=([^&#\s]+)/i);
  if (matched?.[1]) return normalizeCode(decodeURIComponent(matched[1]));

  const plainToken = trimmed.match(/[A-Z0-9]{6,}/i)?.[0];
  return plainToken ? normalizeCode(plainToken) : normalizeCode(trimmed);
};

const toClientRecord = (row: Record<string, unknown>): OriginalityRecord => ({
  id: String(row.id ?? ""),
  lisansKod: String(row.lisans_kod ?? ""),
  qrRawValue: String(row.qr_raw_value ?? ""),
  productName: String(row.product_name ?? ""),
  productSlug: String(row.product_slug ?? ""),
  serialNo: String(row.serial_no ?? ""),
  batchNo: String(row.batch_no ?? ""),
  productionDate: String(row.production_date ?? ""),
  expiryDate: String(row.expiry_date ?? ""),
  soldToName: String(row.sold_to_name ?? ""),
  soldToCity: String(row.sold_to_city ?? ""),
  soldToPhone: String(row.sold_to_phone ?? ""),
  soldAt: String(row.sold_at ?? ""),
  notes: String(row.notes ?? ""),
  active: Boolean(row.active ?? true),
  createdAt: String(row.created_at ?? ""),
  updatedAt: String(row.updated_at ?? ""),
});

const readOriginalityRecords = async (): Promise<OriginalityRecord[]> => {
  const { data, error } = await supabaseAdmin
    .from("originality_records")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => toClientRecord(row as Record<string, unknown>));
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCode = typeof body?.code === "string" ? body.code : "";
    const rawTrimmed = rawCode.trim();
    const code = extractLicenseCode(rawCode);

    if (!rawTrimmed) {
      return NextResponse.json(
        { ok: false, error: "Geçerli bir kod girin." },
        { status: 400 },
      );
    }

    const records = await readOriginalityRecords();
    const matchedRecordByCode = code
      ? records.find((item) => normalizeCode(item.lisansKod) === code)
      : null;

    const matchedRecordByRaw = records.find(
      (item) =>
        item.qrRawValue &&
        canonicalizeLink(item.qrRawValue) === canonicalizeLink(rawTrimmed),
    );

    const matchedRecord = matchedRecordByCode ?? matchedRecordByRaw;
    const products = await getMergedProducts();

    const toVerifyProduct = (product: (typeof products)[number]): VerifyProduct => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      barcode: product.barcode ?? "",
      approvalNo: product.approvalNo ?? null,
      batchNo: product.batchNo ?? null,
      image: product.image ?? null,
      price: typeof product.price === "number" ? product.price : null,
    });

    if (matchedRecord) {
      const matchedProduct = products.find((product) => {
        if (matchedRecord.productSlug && product.slug === matchedRecord.productSlug) return true;
        return (
          normalizeCode(product.name) === normalizeCode(matchedRecord.productName) &&
          (!matchedRecord.productSlug || normalizeCode(product.slug) === normalizeCode(matchedRecord.productSlug))
        );
      });

      return NextResponse.json({
        ok: true,
        isOriginal: true,
        verificationType: "license",
        checkedCode: code || rawTrimmed,
        checkedAt: new Date().toISOString(),
        message: "Ürün lisans kodu doğrulandı.",
        record: matchedRecord,
        matchedProduct: matchedProduct ? toVerifyProduct(matchedProduct) : null,
      });
    }

    const matches = products.filter(
      (product) =>
        typeof product.barcode === "string" &&
        normalizeCode(product.barcode) === code,
    );

    if (matches.length === 0) {
      return NextResponse.json({
        ok: true,
        isOriginal: false,
        verificationType: "none",
        checkedCode: code || rawTrimmed,
        checkedAt: new Date().toISOString(),
        message: "Kod sistemde bulunamadı.",
      });
    }

    return NextResponse.json({
      ok: true,
      isOriginal: true,
      verificationType: "barcode",
      checkedCode: code,
      checkedAt: new Date().toISOString(),
      message: "Ürün barkodu doğrulandı.",
      products: matches.map(toVerifyProduct),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Sorgulama sırasında hata oluştu." },
      { status: 500 },
    );
  }
}
