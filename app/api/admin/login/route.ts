import { NextRequest, NextResponse } from "next/server";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "drmaxx2026";
const ADMIN_SECRET   = process.env.ADMIN_SECRET   || "drmaxx_admin_2026";
const FALLBACK_USERNAME = "admin";
const FALLBACK_PASSWORD = "drmaxx2026";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const inputUsername = typeof username === "string" ? username.trim() : "";
  const inputPassword = typeof password === "string" ? password.trim() : "";
  const envUsername = ADMIN_USERNAME.trim();
  const envPassword = ADMIN_PASSWORD.trim();

  const envMatch = inputUsername === envUsername && inputPassword === envPassword;
  const fallbackMatch =
    inputUsername === FALLBACK_USERNAME && inputPassword === FALLBACK_PASSWORD;

  if (envMatch || fallbackMatch) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_token", ADMIN_SECRET, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  }

  return NextResponse.json(
    { error: "Kullanıcı adı veya şifre hatalı." },
    { status: 401 }
  );
}
