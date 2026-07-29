import { NextResponse } from "next/server";
import {
  findByToken,
  updateRow,
  visitorToRow,
  STATUS_OUT,
} from "@/lib/sheets";
import { nowIST } from "@/lib/time";

export const dynamic = "force-dynamic";

/**
 * POST /api/punch-out — set the actual departure time for a token.
 * Public (a visitor uses their token) and also used by admins from the dashboard.
 * Body: { token: string }
 */
export async function POST(req: Request) {
  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const token = (body.token ?? "").trim();
  if (!token) {
    return NextResponse.json({ error: "Token is required." }, { status: 400 });
  }

  try {
    const visitor = await findByToken(token);
    if (!visitor) {
      return NextResponse.json(
        { error: `No visitor found for token "${token}".` },
        { status: 404 }
      );
    }

    if (visitor.punchOut) {
      return NextResponse.json(
        {
          error: `Already punched out at ${visitor.punchOut}.`,
          alreadyOut: true,
          visitor: publicView(visitor),
        },
        { status: 409 }
      );
    }

    const time = nowIST();
    visitor.punchOut = time;
    visitor.status = STATUS_OUT;
    await updateRow(visitor.rowNumber, visitorToRow(visitor));

    return NextResponse.json({ punchOut: time, visitor: publicView(visitor) });
  } catch (err) {
    console.error("Punch-out failed:", err);
    return NextResponse.json(
      { error: "Could not punch out. Please try again." },
      { status: 500 }
    );
  }
}

// Only expose non-sensitive fields for the public confirmation screen.
function publicView(v: {
  token: string;
  name: string;
  room: string;
  punchIn: string;
  punchOut: string;
}) {
  return {
    token: v.token,
    name: v.name,
    room: v.room,
    punchIn: v.punchIn,
    punchOut: v.punchOut,
  };
}
