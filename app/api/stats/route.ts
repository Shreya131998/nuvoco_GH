import { NextResponse } from "next/server";
import { getVisitors, STATUS_OUT } from "@/lib/sheets";
import { getSessionEmail } from "@/lib/session";
import { todayKeyIST, dateKeyIST } from "@/lib/time";

export const dynamic = "force-dynamic";

/** GET /api/stats — admin dashboard counters. */
export async function GET() {
  const adminEmail = await getSessionEmail().catch(() => null);
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const visitors = await getVisitors();
    const today = todayKeyIST();

    // Head-count: a booking with a second guest counts as 2 people.
    const heads = (v: { secondPerson: string }) =>
      1 + (v.secondPerson?.trim() ? 1 : 0);
    const sumHeads = (arr: { secondPerson: string }[]) =>
      arr.reduce((n, v) => n + heads(v), 0);

    const inHouse = visitors.filter((v) => !v.punchOut);
    const roomsOccupied = new Set(
      inHouse.map((v) => v.room.trim()).filter(Boolean)
    ).size;

    const checkedInToday = visitors.filter(
      (v) => dateKeyIST(v.punchIn) === today
    );
    const punchedOutToday = visitors.filter(
      (v) => v.punchOut && dateKeyIST(v.punchOut) === today
    );

    const stats = {
      // People counts include second guests; rooms is still room-based.
      total: sumHeads(visitors),
      inHouse: sumHeads(inHouse),
      roomsOccupied,
      checkInsToday: sumHeads(checkedInToday),
      punchOutsToday: sumHeads(punchedOutToday),
      checkedOut: visitors.filter((v) => v.status === STATUS_OUT || v.punchOut)
        .length,
    };

    return NextResponse.json({ stats });
  } catch (err) {
    console.error("Stats failed:", err);
    return NextResponse.json({ error: "Could not load stats." }, { status: 500 });
  }
}
