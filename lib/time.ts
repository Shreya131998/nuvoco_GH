// IST (Asia/Kolkata) time helpers. The Google Sheet is the source of truth, so we
// store human-readable IST strings that read correctly straight from the sheet.

const IST_TZ = "Asia/Kolkata";

const MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

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
  // Our display format ("05 Nov 2026, 11:00 pm") is already IST wall time. Read
  // the date part directly — new Date() would parse it in the server's timezone
  // (UTC on Vercel) and push late-evening times onto the next IST day.
  const display = /^(\d{1,2}) ([A-Za-z]{3,4})\w* (\d{4})/.exec(value.trim());
  if (display) {
    const month = MONTHS.indexOf(display[2].slice(0, 3).toLowerCase()) + 1;
    if (month > 0) {
      return `${display[3]}-${String(month).padStart(2, "0")}-${display[1].padStart(2, "0")}`;
    }
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return todayKeyIST(parsed);
}

/**
 * Turn a raw sheet cell into display text. Numbers are treated as Google Sheets
 * date serials (days since 1899-12-30, in the sheet's local time = IST) — this
 * happens when Sheets auto-parsed one of our time strings — and are converted
 * back to the same format nowIST() writes.
 */
export function cellToText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value !== "number") return value.toString();
  // Serial is IST wall-clock time; build it as UTC and format in UTC so no
  // timezone shift is applied. Round to the minute to drop float noise.
  const ms = Math.round(((value - 25569) * 86400000) / 60000) * 60000;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ms));
}

/** Shift a YYYY-MM-DD key by a number of calendar days. */
export function addDaysToKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}
