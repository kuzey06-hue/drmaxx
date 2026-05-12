import { NextRequest, NextResponse } from "next/server";
import { readCmsContent, writeCmsContent } from "@/lib/cmsStore";

const CMS_KEY = "marketplace_settings";
const MASK_RE = /^(\*+|•+|â€¢+)$/;

async function read() {
  return readCmsContent<Record<string, Record<string, unknown>>>(CMS_KEY, {});
}

async function write(data: unknown) {
  await writeCmsContent(CMS_KEY, data);
}

export async function GET() {
  const data = await read();
  const safe = JSON.parse(JSON.stringify(data));

  for (const key of Object.keys(safe)) {
    if (safe[key]?.apiSecret) safe[key].apiSecret = "********";
    if (safe[key]?.password) safe[key].password = "********";
  }

  return NextResponse.json(safe);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { marketplace, ...fields } = body as Record<string, unknown>;

  if (typeof marketplace !== "string" || !marketplace.trim()) {
    return NextResponse.json({ ok: false, error: "marketplace zorunlu." }, { status: 400 });
  }

  const data = await read();
  const current = data[marketplace] ?? {};
  const updated: Record<string, unknown> = { ...current };

  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === "string" && MASK_RE.test(v)) continue;
    updated[k] = v;
  }

  data[marketplace] = updated;
  await write(data);
  return NextResponse.json({ ok: true });
}
