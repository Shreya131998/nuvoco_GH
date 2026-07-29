import { NextResponse } from "next/server";
import { initSheet, initGymSheet } from "@/lib/sheets";
import { getSessionEmail } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * POST /api/init — one-time setup that ensures the "Visitors" tab + header row
 * exist. Admin-only so it can't be triggered anonymously.
 */
export async function POST() {
  const adminEmail = await getSessionEmail().catch(() => null);
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await initSheet();
    await initGymSheet();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Init sheet failed:", err);
    return NextResponse.json(
      { error: "Could not initialize the sheet. Check sharing + credentials." },
      { status: 500 }
    );
  }
}
