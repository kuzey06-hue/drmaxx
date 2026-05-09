import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "drmaxx_admin_2026";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin rotaları ────────────────────────────────────────────────────────
  if (pathname === "/admin/login") {
    const token = req.cookies.get("admin_token")?.value;
    if (token === ADMIN_SECRET) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("admin_token")?.value;
    if (!token || token !== ADMIN_SECRET) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Kullanıcı rotaları (/hesabim) ─────────────────────────────────────────
  if (pathname.startsWith("/hesabim")) {
    const jwtToken = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET ?? "drmaxx_nextauth_secret_change_in_prod",
    });
    if (!jwtToken) {
      const loginUrl = new URL("/giris", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/hesabim/:path*"],
};
