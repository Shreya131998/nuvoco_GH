// Cookie-based session helpers for route handlers and server components.
// Kept separate from lib/auth.ts because next/headers is not available in Edge
// middleware (which imports the pure verify function from lib/auth.ts directly).

import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
} from "./auth";

/** The signed-in admin email, or null. */
export async function getSessionEmail(): Promise<string | null> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

/** Set the session cookie for a freshly-authenticated admin. */
export async function setSession(email: string): Promise<void> {
  const token = await createSessionToken(email);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/** Clear the session cookie. */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}
