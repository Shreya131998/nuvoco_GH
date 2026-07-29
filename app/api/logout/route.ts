import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/** POST /api/logout — clears the session and redirects to the login page. */
export async function POST(req: Request) {
  await clearSession();
  return NextResponse.redirect(new URL("/admin/login", req.url), { status: 303 });
}
