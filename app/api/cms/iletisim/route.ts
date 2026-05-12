import { NextRequest, NextResponse } from "next/server";
import { readCmsContent, writeCmsContent } from "@/lib/cmsStore";

const CMS_KEY = "contact_content";

export async function GET() {
  const data = await readCmsContent<Record<string, unknown>>(CMS_KEY, {});
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  await writeCmsContent(CMS_KEY, body);
  return NextResponse.json({ ok: true });
}
