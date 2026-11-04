// Gym streaks: how many calendar days in a row (IST) an employee has checked in.
// Strict rule — every day counts, missing one resets the streak.

import type { GymEntry } from "@/lib/sheets";
import { addDaysToKey, dateKeyIST, todayKeyIST } from "@/lib/time";

function codeKey(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Current streak for an employee. If they haven't checked in today yet, a
 * streak that ran through yesterday is still alive, so it's counted from there.
 */
export function currentStreak(
  entries: GymEntry[],
  employeeCode: string,
  today: string = todayKeyIST()
): number {
  const wanted = codeKey(employeeCode);
  const days = new Set(
    entries
      .filter((e) => codeKey(e.employeeCode) === wanted)
      .map((e) => dateKeyIST(e.time))
      .filter(Boolean)
  );

  let day = days.has(today) ? today : addDaysToKey(today, -1);
  let streak = 0;
  while (days.has(day)) {
    streak++;
    day = addDaysToKey(day, -1);
  }
  return streak;
}
