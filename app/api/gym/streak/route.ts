import { NextResponse } from "next/server";
import { getGymEntries } from "@/lib/sheets";
import { currentStreak } from "@/lib/streak";

export const dynamic = "force-dynamic";

/**
 * POST /api/gym/streak — public. Body: { employeeCode, mobile }.
 * Used by the "Welcome back" screen. The mobile must match one of the
 * employee's entries, so streaks can't be looked up by employee code alone.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const employeeCode = (body.employeeCode ?? "").toString().trim().toUpperCase();
  const mobile = (body.mobile ?? "").toString().replace(/\D/g, "").slice(-10);
  if (!employeeCode || mobile.length !== 10) {
    return NextResponse.json({ error: "Missing details." }, { status: 400 });
  }

  try {
    const entries = await getGymEntries();
    const known = entries.some(
      (e) =>
        e.employeeCode.trim().toUpperCase() === employeeCode &&
        e.mobile.replace(/\D/g, "").slice(-10) === mobile
    );
    if (!known) return NextResponse.json({ streak: 0 });
    return NextResponse.json({ streak: currentStreak(entries, employeeCode) });
  } catch (err) {
    console.error("Gym streak failed:", err);
    return NextResponse.json({ error: "Could not load streak." }, { status: 500 });
  }
}
