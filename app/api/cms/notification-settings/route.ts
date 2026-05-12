import { NextRequest, NextResponse } from "next/server";
import {
  readNotificationSettings,
  writeNotificationSettings,
} from "@/lib/notificationSettings";

export async function GET() {
  return NextResponse.json(await readNotificationSettings());
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  await writeNotificationSettings(body);
  return NextResponse.json({ ok: true });
}
