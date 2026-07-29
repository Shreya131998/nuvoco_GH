// Simple email + password admin auth backed by a signed (HMAC) session cookie.
// No third-party provider — only the accounts listed in ADMIN_USERS can sign in.
//
// This file is PURE (no next/headers import) so it can be used from Edge
// middleware. Cookie reading for route handlers/server components lives in
// lib/session.ts.

export const COOKIE_NAME = "gh_session";
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours (seconds)

/** Encode to a fresh, ArrayBuffer-backed Uint8Array (satisfies Web Crypto types). */
function enc(s: string) {
  const src = new TextEncoder().encode(s);
  const out = new Uint8Array(src.length);
  out.set(src);
  return out;
}

function secretKeyMaterial() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return enc(s);
}

/** Parse ADMIN_USERS ("email:password,email2:password2") into a map. */
function parseUsers(): Record<string, string> {
  const raw = process.env.ADMIN_USERS ?? "";
  const map: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const idx = pair.indexOf(":");
    if (idx === -1) continue;
    const email = pair.slice(0, idx).trim().toLowerCase();
    const password = pair.slice(idx + 1); // password kept verbatim (may end in spaces)
    if (email) map[email] = password;
  }
  return map;
}

/** True if the email is one of the configured admins. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() in parseUsers();
}

/** Check a login attempt. Returns the normalized email on success, else null. */
export function verifyCredentials(
  email: string,
  password: string
): string | null {
  const users = parseUsers();
  const e = email.trim().toLowerCase();
  const stored = users[e];
  if (stored === undefined) return null;
  if (!safeEqual(stored, password)) return null;
  return e;
}

// -------------------- token signing (Web Crypto, edge-safe) --------------------

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    secretKeyMaterial(),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(email: string): Promise<string> {
  const payload = b64urlEncode(
    JSON.stringify({ e: email.toLowerCase(), exp: Date.now() + SESSION_MAX_AGE * 1000 })
  );
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc(payload));
  return `${payload}.${b64urlBytes(new Uint8Array(sig))}`;
}

/** Verify a session token; returns the email if valid, allowlisted, and unexpired. */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<string | null> {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot === -1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const key = await hmacKey();
  let valid = false;
  try {
    valid = await crypto.subtle.verify("HMAC", key, b64urlToBytes(sig), enc(payload));
  } catch {
    return null;
  }
  if (!valid) return null;

  try {
    const data = JSON.parse(b64urlDecode(payload)) as { e?: string; exp?: number };
    if (!data.e || typeof data.exp !== "number") return null;
    if (Date.now() > data.exp) return null;
    if (!isAdminEmail(data.e)) return null;
    return data.e;
  } catch {
    return null;
  }
}

// -------------------- helpers --------------------

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function b64urlBytes(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlEncode(s: string): string {
  return b64urlBytes(new TextEncoder().encode(s));
}

function b64urlToBytes(s: string) {
  let t = s.replace(/-/g, "+").replace(/_/g, "/");
  while (t.length % 4) t += "=";
  const bin = atob(t);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function b64urlDecode(s: string): string {
  return new TextDecoder().decode(b64urlToBytes(s));
}
