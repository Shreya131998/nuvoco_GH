// Shared field definitions + validation used by the API and the forms so the two
// never drift apart.

export interface VisitorInput {
  name: string;
  secondPerson: string;
  company: string;
  room: string;
  designation: string;
  mobile: string;
  arrival: string;
  expectedDeparture: string;
  purpose: string;
  reference: string;
}

export const EMPTY_INPUT: VisitorInput = {
  name: "",
  secondPerson: "",
  company: "",
  room: "",
  designation: "",
  mobile: "",
  arrival: "",
  expectedDeparture: "",
  purpose: "",
  reference: "",
};

/** Field metadata drives the shared form UI. */
export interface FieldDef {
  key: keyof VisitorInput;
  label: string;
  type: "text" | "tel" | "datetime-local" | "textarea";
  required?: boolean;
  placeholder?: string;
}

export const FIELDS: FieldDef[] = [
  { key: "name", label: "Visitor Name", type: "text", required: true },
  {
    key: "secondPerson",
    label: "Second Guest Name",
    type: "text",
    placeholder: "If 2 people share the room",
  },
  { key: "company", label: "Company Name", type: "text" },
  { key: "room", label: "Room No Allotted", type: "text" },
  { key: "designation", label: "Designation", type: "text" },
  {
    key: "mobile",
    label: "Mobile No",
    type: "tel",
    required: true,
    placeholder: "10-digit number",
  },
  // NOTE: "arrival" is intentionally NOT a form field — it is stamped
  // automatically on the server at check-in time (see /api/visitors POST).
  {
    key: "expectedDeparture",
    label: "Expected Departure Date & Time",
    type: "datetime-local",
  },
  { key: "purpose", label: "Purpose of Visit", type: "textarea" },
  { key: "reference", label: "Reference", type: "text" },
];

// ---------------------------------------------------------------------------
// Gym attendance input — employees just submit name + employee code.
// ---------------------------------------------------------------------------

export interface GymInput {
  name: string;
  employeeCode: string;
  mobile: string;
}

export function validateGymInput(
  raw: Partial<GymInput>
): { ok: true; value: GymInput } | { ok: false; error: string } {
  const name = (raw.name ?? "").toString().trim();
  const employeeCode = (raw.employeeCode ?? "").toString().trim();
  const mobile = (raw.mobile ?? "").toString().trim();
  if (!name) return { ok: false, error: "Name is required." };
  if (!employeeCode) return { ok: false, error: "Employee code is required." };
  if (!mobile) return { ok: false, error: "Mobile number is required." };
  if (!isValidMobile(mobile)) {
    return { ok: false, error: "Enter a valid 10-digit mobile number." };
  }
  return { ok: true, value: { name, employeeCode, mobile } };
}

/** Accepts a 10-digit Indian mobile, optionally +91 / leading 0. */
export function isValidMobile(mobile: string): boolean {
  const digits = mobile.replace(/[\s-]/g, "");
  return /^(\+?91|0)?[6-9]\d{9}$/.test(digits);
}

/**
 * Validate + normalize raw input. Returns either an error string or a clean
 * VisitorInput. Trims everything and requires name + a valid mobile.
 */
export function validateInput(
  raw: Partial<VisitorInput>
): { ok: true; value: VisitorInput } | { ok: false; error: string } {
  const value: VisitorInput = { ...EMPTY_INPUT };
  for (const f of FIELDS) {
    value[f.key] = (raw[f.key] ?? "").toString().trim();
  }
  if (!value.name) return { ok: false, error: "Visitor name is required." };
  if (!value.mobile) return { ok: false, error: "Mobile number is required." };
  if (!isValidMobile(value.mobile)) {
    return { ok: false, error: "Enter a valid 10-digit mobile number." };
  }
  return { ok: true, value };
}
