import { NextRequest, NextResponse } from "next/server";
import { readCmsContent, writeCmsContent } from "@/lib/cmsStore";

const CMS_KEY = "menu_items";
type MenuItem = Record<string, unknown> & { id: number; order?: number };

async function read() {
  return readCmsContent<MenuItem[]>(CMS_KEY, []);
}

async function write(data: MenuItem[]) {
  await writeCmsContent(CMS_KEY, data);
}

export async function GET() {
  return NextResponse.json(await read());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const items = await read();
  const newItem: MenuItem = { ...body, id: Date.now(), order: items.length + 1 };
  await write([...items, newItem]);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown> | MenuItem[];
  const items = await read();

  if (Array.isArray(body)) {
    await write(body as MenuItem[]);
  } else {
    const updated = items.map((i) => (i.id === Number(body.id) ? ({ ...i, ...body } as MenuItem) : i));
    await write(updated);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = Number(new URL(req.url).searchParams.get("id"));
  const items = await read();
  await write(items.filter((i) => i.id !== id));
  return NextResponse.json({ ok: true });
}
