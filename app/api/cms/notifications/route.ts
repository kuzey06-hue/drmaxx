import { NextRequest, NextResponse } from "next/server";
import {
  createAdminNotification,
  readAdminNotifications,
  writeAdminNotifications,
} from "@/lib/adminNotifications";

export async function GET() {
  return NextResponse.json(await readAdminNotifications());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  await createAdminNotification({
    type: body.type ?? "system",
    title: String(body.title ?? "Bildirim"),
    message: String(body.message ?? ""),
    href: typeof body.href === "string" ? body.href : undefined,
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const items = await readAdminNotifications();

  if (body.all) {
    await writeAdminNotifications(items.map((item) => ({ ...item, read: true })));
    return NextResponse.json({ ok: true });
  }

  const id = String(body.id ?? "");
  await writeAdminNotifications(
    items.map((item) => (item.id === id ? { ...item, read: true } : item)),
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await writeAdminNotifications([]);
  return NextResponse.json({ ok: true });
}
