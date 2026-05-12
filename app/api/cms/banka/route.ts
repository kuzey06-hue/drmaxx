import { NextRequest, NextResponse } from "next/server";
import { readCmsContent, writeCmsContent } from "@/lib/cmsStore";

const CMS_KEY = "bank_settings";

async function read() {
  return readCmsContent<Record<string, unknown>>(CMS_KEY, { active: false, accounts: [] });
}
async function write(data: unknown) {
  await writeCmsContent(CMS_KEY, data);
}

export async function GET() {
  return NextResponse.json(await read());
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  await write(body);
  return NextResponse.json({ ok: true });
}
