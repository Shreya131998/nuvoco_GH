import { NextResponse } from "next/server";
import {
  appendRow,
  getVisitors,
  HEADERS,
  STATUS_IN,
  COL,
} from "@/lib/sheets";
import { nextToken } from "@/lib/token";
import { validateInput } from "@/lib/validation";
import { nowIST } from "@/lib/time";
import { getSessionEmail } from "@/lib/session";

// Avoid any static optimization — these always hit the live sheet.
export const dynamic = "force-dynamic";

/**
 * POST /api/visitors — public check-in. Creates a row and returns the new token.
 * Admins may also call this (Entered By is set to their email when logged in).
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = validateInput(body as never);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const input = result.value;

  // Determine who is entering this record.
  const adminEmail = await getSessionEmail().catch(() => null);
  const enteredBy = adminEmail ?? "Self";

  try {
    const existing = await getVisitors();
    const token = nextToken(existing);
    const now = nowIST();

    const row: string[] = new Array(HEADERS.length).fill("");
    row[COL.TOKEN] = token;
    row[COL.NAME] = input.name;
    row[COL.SECOND_PERSON] = input.secondPerson;
    row[COL.COMPANY] = input.company;
    row[COL.ROOM] = input.room;
    row[COL.DESIGNATION] = input.designation;
    row[COL.MOBILE] = input.mobile;
    row[COL.ARRIVAL] = input.arrival || now;
    row[COL.EXPECTED_DEPARTURE] = input.expectedDeparture;
    row[COL.PURPOSE] = input.purpose;
    row[COL.REFERENCE] = input.reference;
    row[COL.PUNCH_IN] = now;
    row[COL.PUNCH_OUT] = "";
    row[COL.STATUS] = STATUS_IN;
    row[COL.ENTERED_BY] = enteredBy;
    row[COL.CREATED_AT] = now;

    await appendRow(row);
    return NextResponse.json({ token }, { status: 201 });
  } catch (err) {
    console.error("Create visitor failed:", err);
    return NextResponse.json(
      { error: "Could not save the record. Please try again." },
      { status: 500 }
    );
  }
}

/** GET /api/visitors — admin only. Returns all rows (newest first). */
export async function GET() {
  const adminEmail = await getSessionEmail().catch(() => null);
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const visitors = await getVisitors();
    visitors.reverse(); // newest first
    return NextResponse.json({ visitors });
  } catch (err) {
    console.error("List visitors failed:", err);
    return NextResponse.json(
      { error: "Could not load visitors." },
      { status: 500 }
    );
  }
}
