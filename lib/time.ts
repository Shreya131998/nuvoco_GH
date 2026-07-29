// IST (Asia/Kolkata) time helpers. The Google Sheet is the source of truth, so we
// store human-readable IST strings that read correctly straight from the sheet.

const IST_TZ = "Asia/Kolkata";

/** Current timestamp formatted as "27 Jul 2026, 03:45 PM" in IST. */
export function nowIST(): string {
  return formatIST(new Date());
}

/** Format a Date (or ISO string) as an IST display string. */
export function formatIST(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/** YYYY-MM-DD for "today" in IST — used for same-day comparisons in stats. */
export function todayKeyIST(now: Date = new Date()): string {
  // en-CA yields YYYY-MM-DD which is easy to compare as a string.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Best-effort YYYY-MM-DD (IST) for an arbitrary stored value. Handles ISO strings,
 * datetime-local values, and our display format. Returns "" when unparseable.
 */
export function dateKeyIST(value: string | undefined | null): string {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return todayKeyIST(parsed);
}
