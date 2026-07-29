import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth";
import { setSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/** POST /api/login — { email, password }. Sets the session cookie on success. */
export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const verified = verifyCredentials(email, password);
  if (!verified) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  await setSession(verified);
  return NextResponse.json({ ok: true });
}
