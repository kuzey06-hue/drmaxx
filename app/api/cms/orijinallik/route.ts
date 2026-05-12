import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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

const normalizeLicenseCode = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "");

const toClient = (row: Record<string, unknown>): OriginalityRecord => ({
  id: String(row.id ?? ""),
  lisansKod: String(row.lisans_kod ?? row.lisansKod ?? ""),
  qrRawValue: String(row.qr_raw_value ?? row.qrRawValue ?? ""),
  productName: String(row.product_name ?? row.productName ?? ""),
  productSlug: String(row.product_slug ?? row.productSlug ?? ""),
  serialNo: String(row.serial_no ?? row.serialNo ?? ""),
  batchNo: String(row.batch_no ?? row.batchNo ?? ""),
  productionDate: String(row.production_date ?? row.productionDate ?? ""),
  expiryDate: String(row.expiry_date ?? row.expiryDate ?? ""),
  soldToName: String(row.sold_to_name ?? row.soldToName ?? ""),
  soldToCity: String(row.sold_to_city ?? row.soldToCity ?? ""),
  soldToPhone: String(row.sold_to_phone ?? row.soldToPhone ?? ""),
  soldAt: String(row.sold_at ?? row.soldAt ?? ""),
  notes: String(row.notes ?? ""),
  active: Boolean(row.active ?? true),
  createdAt: String(row.created_at ?? row.createdAt ?? ""),
  updatedAt: String(row.updated_at ?? row.updatedAt ?? ""),
});

const toDb = (row: Partial<OriginalityRecord>) => ({
  id: row.id,
  lisans_kod: normalizeLicenseCode(row.lisansKod ?? ""),
  qr_raw_value: typeof row.qrRawValue === "string" ? row.qrRawValue.trim() : "",
  product_name: row.productName ?? "",
  product_slug: row.productSlug ?? "",
  serial_no: row.serialNo ?? "",
  batch_no: row.batchNo ?? "",
  production_date: row.productionDate ?? "",
  expiry_date: row.expiryDate ?? "",
  sold_to_name: row.soldToName ?? "",
  sold_to_city: row.soldToCity ?? "",
  sold_to_phone: row.soldToPhone ?? "",
  sold_at: row.soldAt ?? "",
  notes: row.notes ?? "",
  active: row.active ?? true,
  updated_at: new Date().toISOString(),
});

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("originality_records")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map((row) => toClient(row as Record<string, unknown>)));
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as
    | Partial<OriginalityRecord>
    | { records?: Partial<OriginalityRecord>[] }
    | Partial<OriginalityRecord>[];

  const now = new Date().toISOString();

  const makeRecord = (row: Partial<OriginalityRecord>, idx = 0) => {
    const id = row.id || `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`;
    const next = {
      ...toDb({ ...row, id }),
      id,
      created_at: now,
    };
    return next;
  };

  const bulkRows = Array.isArray(body)
    ? body
    : Array.isArray((body as { records?: Partial<OriginalityRecord>[] }).records)
      ? (body as { records: Partial<OriginalityRecord>[] }).records
      : null;

  if (bulkRows) {
    const payload = bulkRows
      .map((row, idx) => makeRecord(row, idx))
      .filter((row) => !!row.lisans_kod);

    if (payload.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Eklenecek geçerli lisans kodu bulunamadı." },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("originality_records")
      .upsert(payload, { onConflict: "lisans_kod" });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, inserted: payload.length }, { status: 201 });
  }

  const single = makeRecord(body as Partial<OriginalityRecord>);
  if (!single.lisans_kod) {
    return NextResponse.json(
      { ok: false, error: "Lisans kodu zorunludur." },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("originality_records")
    .insert(single)
    .select("*")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json(toClient(data as Record<string, unknown>), { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as Partial<OriginalityRecord> & { id?: string };
  if (!body.id) {
    return NextResponse.json(
      { ok: false, error: "Kayıt id zorunludur." },
      { status: 400 },
    );
  }

  const row = toDb(body);
  if (!row.lisans_kod) {
    return NextResponse.json(
      { ok: false, error: "Lisans kodu zorunludur." },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin
    .from("originality_records")
    .update(row)
    .eq("id", body.id);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Kayıt id zorunludur." },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin.from("originality_records").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
