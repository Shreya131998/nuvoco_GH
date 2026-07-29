import type { Visitor } from "./sheets";

const PREFIX = "GH-";
const PAD = 3; // GH-001, GH-042, ... grows past 3 digits automatically.

/**
 * Compute the next sequential token from the existing rows. We derive it from the
 * highest numeric suffix currently present rather than a stored counter, so it
 * stays correct even if rows are deleted from the sheet.
 *
 * Concurrency note: two simultaneous check-ins could read the same max and collide.
 * Guest-house volume is low enough that this is acceptable (documented in README).
 */
export function nextToken(existing: Visitor[]): string {
  let max = 0;
  for (const v of existing) {
    const m = /^GH-(\d+)$/i.exec(v.token.trim());
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  const next = max + 1;
  return PREFIX + String(next).padStart(PAD, "0");
}
