import { NextResponse } from "next/server";
import {
  appendGymRow,
  getGymEntries,
  nextGymEntryNo,
  initGymSheet,
  type GymEntry,
} from "@/lib/sheets";
import { validateGymInput } from "@/lib/validation";
import { nowIST, todayKeyIST, dateKeyIST } from "@/lib/time";
import { getSessionEmail } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Read gym entries, creating the "Gym" tab on first use if it doesn't exist. */
async function readGymEntries(): Promise<GymEntry[]> {
  try {
    return await getGymEntries();
  } catch {
    // Most likely the tab doesn't exist yet — create it, then return empty.
    await initGymSheet();
    return [];
  }
}

/**
 * POST /api/gym — public gym check-in. Body: { name, employeeCode }.
 * Time is stamped automatically. Returns the generated entry number.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = validateGymInput(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const { name, employeeCode, mobile } = result.value;

  const adminEmail = await getSessionEmail().catch(() => null);
  const enteredBy = adminEmail ?? "Self";

  try {
    const entries = await readGymEntries();
    const entryNo = nextGymEntryNo(entries);
    const now = nowIST();

    // Row order must match GYM_HEADERS:
    // Entry No, Name, Employee Code, Time, Entered By, Mobile No
    await appendGymRow([entryNo, name, employeeCode, now, enteredBy, mobile]);
    return NextResponse.json({ entryNo, time: now }, { status: 201 });
  } catch (err) {
    console.error("Gym entry failed:", err);
    return NextResponse.json(
      { error: "Could not save the entry. Please try again." },
      { status: 500 }
    );
  }
}

/** GET /api/gym — admin only. Returns entries (newest first) + counters. */
export async function GET() {
  const adminEmail = await getSessionEmail().catch(() => null);
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entries = await readGymEntries();
    entries.reverse(); // newest first

    const today = todayKeyIST();
    const stats = {
      total: entries.length,
      today: entries.filter((e) => dateKeyIST(e.time) === today).length,
    };

    return NextResponse.json({ entries, stats });
  } catch (err) {
    console.error("Gym list failed:", err);
    return NextResponse.json(
      { error: "Could not load gym entries." },
      { status: 500 }
    );
  }
}
