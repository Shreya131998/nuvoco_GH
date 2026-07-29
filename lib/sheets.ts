import { google, type sheets_v4 } from "googleapis";

// ---------------------------------------------------------------------------
// Sheet schema. Column order MUST match the header row written by initSheet().
// ---------------------------------------------------------------------------

export const SHEET_TAB = "Visitors";

export const HEADERS = [
  "Token",
  "Visitor Name",
  "Company Name",
  "Room No Allotted",
  "Designation",
  "Mobile No",
  "Arrival Date & Time",
  "Expected Departure Date & Time",
  "Purpose of Visit",
  "Reference",
  "Punch-In Time",
  "Punch-Out Time",
  "Status",
  "Entered By",
  "Created At",
  "Second Guest Name",
] as const;

// 0-based column indexes for readable access.
export const COL = {
  TOKEN: 0,
  NAME: 1,
  COMPANY: 2,
  ROOM: 3,
  DESIGNATION: 4,
  MOBILE: 5,
  ARRIVAL: 6,
  EXPECTED_DEPARTURE: 7,
  PURPOSE: 8,
  REFERENCE: 9,
  PUNCH_IN: 10,
  PUNCH_OUT: 11,
  STATUS: 12,
  ENTERED_BY: 13,
  CREATED_AT: 14,
  // Appended after the original columns so existing sheet rows stay aligned.
  SECOND_PERSON: 15,
} as const;

export const STATUS_IN = "Checked-In";
export const STATUS_OUT = "Checked-Out";

/** Shape returned to the app. `rowNumber` is the 1-based sheet row (header = 1). */
export interface Visitor {
  rowNumber: number;
  token: string;
  name: string;
  company: string;
  room: string;
  designation: string;
  mobile: string;
  arrival: string;
  expectedDeparture: string;
  purpose: string;
  reference: string;
  punchIn: string;
  punchOut: string;
  status: string;
  enteredBy: string;
  createdAt: string;
  secondPerson: string;
}

// ---------------------------------------------------------------------------
// Auth + client (cached across invocations in the same server instance).
// ---------------------------------------------------------------------------

let cachedClient: sheets_v4.Sheets | null = null;

function getSheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("GOOGLE_SHEET_ID is not set");
  return id;
}

function getClient(): sheets_v4.Sheets {
  if (cachedClient) return cachedClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY must be set"
    );
  }

  // Env vars store the private key with literal "\n"; convert to real newlines.
  const privateKey = rawKey.replace(/\\n/g, "\n");

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  cachedClient = google.sheets({ version: "v4", auth });
  return cachedClient;
}

// ---------------------------------------------------------------------------
// Row <-> Visitor mapping.
// ---------------------------------------------------------------------------

function rowToVisitor(row: string[], rowNumber: number): Visitor {
  const at = (i: number) => (row[i] ?? "").toString();
  return {
    rowNumber,
    token: at(COL.TOKEN),
    name: at(COL.NAME),
    company: at(COL.COMPANY),
    room: at(COL.ROOM),
    designation: at(COL.DESIGNATION),
    mobile: at(COL.MOBILE),
    arrival: at(COL.ARRIVAL),
    expectedDeparture: at(COL.EXPECTED_DEPARTURE),
    purpose: at(COL.PURPOSE),
    reference: at(COL.REFERENCE),
    punchIn: at(COL.PUNCH_IN),
    punchOut: at(COL.PUNCH_OUT),
    status: at(COL.STATUS),
    enteredBy: at(COL.ENTERED_BY),
    createdAt: at(COL.CREATED_AT),
    secondPerson: at(COL.SECOND_PERSON),
  };
}

// ---------------------------------------------------------------------------
// Read / write helpers.
// ---------------------------------------------------------------------------

/** All data rows (excludes the header). */
export async function getVisitors(): Promise<Visitor[]> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: `${SHEET_TAB}!A2:P`,
  });
  const rows = res.data.values ?? [];
  return rows.map((row, i) => rowToVisitor(row as string[], i + 2));
}

export async function findByToken(token: string): Promise<Visitor | null> {
  const wanted = token.trim().toUpperCase();
  const all = await getVisitors();
  return all.find((v) => v.token.trim().toUpperCase() === wanted) ?? null;
}

/** Append a fully-ordered row (array must be in HEADERS order). */
export async function appendRow(values: string[]): Promise<void> {
  const sheets = getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSheetId(),
    range: `${SHEET_TAB}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
}

/** Overwrite an entire row (1-based rowNumber) with ordered values. */
export async function updateRow(
  rowNumber: number,
  values: string[]
): Promise<void> {
  const sheets = getClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range: `${SHEET_TAB}!A${rowNumber}:P${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

/** Convert a Visitor back into a HEADERS-ordered row array. */
export function visitorToRow(v: Visitor): string[] {
  const row: string[] = new Array(HEADERS.length).fill("");
  row[COL.TOKEN] = v.token;
  row[COL.NAME] = v.name;
  row[COL.COMPANY] = v.company;
  row[COL.ROOM] = v.room;
  row[COL.DESIGNATION] = v.designation;
  row[COL.MOBILE] = v.mobile;
  row[COL.ARRIVAL] = v.arrival;
  row[COL.EXPECTED_DEPARTURE] = v.expectedDeparture;
  row[COL.PURPOSE] = v.purpose;
  row[COL.REFERENCE] = v.reference;
  row[COL.PUNCH_IN] = v.punchIn;
  row[COL.PUNCH_OUT] = v.punchOut;
  row[COL.STATUS] = v.status;
  row[COL.ENTERED_BY] = v.enteredBy;
  row[COL.CREATED_AT] = v.createdAt;
  row[COL.SECOND_PERSON] = v.secondPerson;
  return row;
}

/**
 * Ensure the "Visitors" tab exists and has the header row. Safe to call
 * repeatedly — it only writes headers when row 1 is empty.
 */
export async function initSheet(): Promise<void> {
  const sheets = getClient();
  const spreadsheetId = getSheetId();

  // Create the tab if it is missing.
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const hasTab = (meta.data.sheets ?? []).some(
    (s) => s.properties?.title === SHEET_TAB
  );
  if (!hasTab) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: SHEET_TAB } } }],
      },
    });
  }

  // Write headers if the first row is blank OR is missing newer columns
  // (so existing sheets pick up appended columns like "Second Guest Name").
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_TAB}!A1:P1`,
  });
  const existing = headerRes.data.values?.[0] ?? [];
  if (existing.length < HEADERS.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_TAB}!A1:P1`,
      valueInputOption: "RAW",
      requestBody: { values: [[...HEADERS]] },
    });
  }
}

// ---------------------------------------------------------------------------
// Gym attendance ("Gym" tab). A simple log — employees just submit their name
// and employee code; the time is stamped automatically. No token / punch-out.
// ---------------------------------------------------------------------------

export const GYM_TAB = "Gym";

export const GYM_HEADERS = [
  "Entry No",
  "Name",
  "Employee Code",
  "Time",
  "Entered By",
  "Mobile No",
] as const;

/** Shape returned to the app. `rowNumber` is the 1-based sheet row (header = 1). */
export interface GymEntry {
  rowNumber: number;
  entryNo: string;
  name: string;
  employeeCode: string;
  time: string;
  enteredBy: string;
  mobile: string;
}

/** All gym rows (excludes the header). */
export async function getGymEntries(): Promise<GymEntry[]> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: `${GYM_TAB}!A2:F`,
  });
  const rows = res.data.values ?? [];
  return rows.map((row, i) => {
    const at = (j: number) => (row[j] ?? "").toString();
    return {
      rowNumber: i + 2,
      entryNo: at(0),
      name: at(1),
      employeeCode: at(2),
      time: at(3),
      enteredBy: at(4),
      mobile: at(5),
    };
  });
}

/** Append a gym row (array in GYM_HEADERS order). */
export async function appendGymRow(values: string[]): Promise<void> {
  const sheets = getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSheetId(),
    range: `${GYM_TAB}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
}

/** Next sequential gym entry number, e.g. "G-001". */
export function nextGymEntryNo(entries: GymEntry[]): string {
  let max = 0;
  for (const e of entries) {
    const m = /^G-(\d+)$/i.exec(e.entryNo.trim());
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `G-${String(max + 1).padStart(3, "0")}`;
}

/** Ensure the "Gym" tab exists with its header row. Safe to call repeatedly. */
export async function initGymSheet(): Promise<void> {
  const sheets = getClient();
  const spreadsheetId = getSheetId();

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const hasTab = (meta.data.sheets ?? []).some(
    (s) => s.properties?.title === GYM_TAB
  );
  if (!hasTab) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: GYM_TAB } } }],
      },
    });
  }

  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${GYM_TAB}!A1:F1`,
  });
  const existing = headerRes.data.values?.[0] ?? [];
  if (existing.length < GYM_HEADERS.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${GYM_TAB}!A1:F1`,
      valueInputOption: "RAW",
      requestBody: { values: [[...GYM_HEADERS]] },
    });
  }
}
