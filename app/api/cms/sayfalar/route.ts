import { NextRequest, NextResponse } from "next/server";
import { readCmsContent, writeCmsContent } from "@/lib/cmsStore";

const CMS_KEY = "pages";
type CmsPage = Record<string, unknown> & { id: number; updated?: string };

async function read() {
  return readCmsContent<CmsPage[]>(CMS_KEY, []);
}

async function write(data: CmsPage[]) {
  await writeCmsContent(CMS_KEY, data);
}

export async function GET() {
  return NextResponse.json(await read());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const pages = await read();
  const newPage: CmsPage = {
    ...body,
    id: Date.now(),
    updated: new Date().toISOString().split("T")[0],
  };

  await write([...pages, newPage]);
  return NextResponse.json(newPage, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const pages = await read();
  const updated = pages.map((p) =>
    p.id === Number(body.id)
      ? ({ ...p, ...body, updated: new Date().toISOString().split("T")[0] } as CmsPage)
      : p,
  );
  await write(updated);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = Number(new URL(req.url).searchParams.get("id"));
  const pages = await read();
  await write(pages.filter((p) => p.id !== id));
  return NextResponse.json({ ok: true });
}
