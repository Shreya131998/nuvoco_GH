import { NextResponse } from "next/server";
import {
  findByToken,
  updateRow,
  visitorToRow,
  STATUS_IN,
  STATUS_OUT,
} from "@/lib/sheets";
import { validateInput } from "@/lib/validation";
import { getSessionEmail } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/visitors/[token] — admin edit of any editable field.
 * Body may include visitor fields plus optional punchOut (string, "" clears it).
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const adminEmail = await getSessionEmail().catch(() => null);
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await params;

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

  try {
    const visitor = await findByToken(token);
    if (!visitor) {
      return NextResponse.json({ error: "Visitor not found." }, { status: 404 });
    }

    // Apply editable fields (token, punch-in, created-at, entered-by are preserved).
    visitor.name = input.name;
    visitor.secondPerson = input.secondPerson;
    visitor.company = input.company;
    visitor.room = input.room;
    visitor.designation = input.designation;
    visitor.mobile = input.mobile;
    // arrival is auto-stamped at check-in and never edited via the form;
    // keep the existing value (input.arrival is always empty now).
    visitor.arrival = input.arrival || visitor.arrival;
    visitor.expectedDeparture = input.expectedDeparture;
    visitor.purpose = input.purpose;
    visitor.reference = input.reference;

    // Admin may set/clear the actual punch-out time; keep status in sync.
    if (typeof body.punchOut === "string") {
      visitor.punchOut = body.punchOut.trim();
    }
    visitor.status = visitor.punchOut ? STATUS_OUT : STATUS_IN;

    await updateRow(visitor.rowNumber, visitorToRow(visitor));
    return NextResponse.json({ visitor });
  } catch (err) {
    console.error("Edit visitor failed:", err);
    return NextResponse.json(
      { error: "Could not update the record." },
      { status: 500 }
    );
  }
}
