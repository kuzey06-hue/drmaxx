import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/newsletter
 *
 * Body: { email: string }
 *
 * Subscribes an email to the DR.MAXX newsletter.
 * In production: integrate with Klaviyo, Mailchimp, or similar.
 */

// In-memory store (replace with DB in production)
const subscribers = new Set<string>();

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi.", code: "INVALID_BODY" },
      { status: 400 }
    );
  }

  const { email } = body as { email?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Geçerli bir e-posta adresi girin.", code: "INVALID_EMAIL" },
      { status: 422 }
    );
  }

  if (subscribers.has(email)) {
    return NextResponse.json(
      { message: "Bu e-posta zaten abone.", code: "ALREADY_SUBSCRIBED" },
      { status: 200 }
    );
  }

  subscribers.add(email);

  return NextResponse.json(
    {
      message: "Bültenimize başarıyla abone oldunuz.",
      code: "SUBSCRIBED",
      email,
      timestamp: new Date().toISOString(),
    },
    { status: 201 }
  );
}

/**
 * GET /api/newsletter — dev only: return subscriber count
 */
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ count: subscribers.size });
}
