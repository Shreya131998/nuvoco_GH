import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";

// Protect the admin dashboard pages and admin-only API routes. Public routes
// (POST /api/visitors, POST /api/punch-out, /api/login, /api/logout) are excluded.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never guard the login page itself (avoids a redirect loop).
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const email = await verifySessionToken(req.cookies.get(COOKIE_NAME)?.value);
  const isLoggedIn = !!email;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi =
    pathname === "/api/stats" ||
    pathname === "/api/init" ||
    (pathname.startsWith("/api/visitors") && req.method !== "POST") ||
    (pathname.startsWith("/api/gym") && req.method !== "POST");

  if ((isAdminPage || isAdminApi) && !isLoggedIn) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/visitors/:path*",
    "/api/gym/:path*",
    "/api/stats",
    "/api/init",
  ],
};
