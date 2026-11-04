// Remembers a gym member's details on their own phone (localStorage) after the
// first check-in, so later scans are a single "Check in" tap. Storage can be
// unavailable (private mode, blocked site data), so every access is guarded and
// the page simply falls back to the full form.

const KEY = "gym-profile-v1";

export interface GymProfile {
  name: string;
  employeeCode: string;
  mobile: string;
}

export function loadGymProfile(): GymProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<GymProfile>;
    if (!p.name || !p.employeeCode || !p.mobile) return null;
    return { name: p.name, employeeCode: p.employeeCode, mobile: p.mobile };
  } catch {
    return null;
  }
}

export function saveGymProfile(profile: GymProfile): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        name: profile.name.trim(),
        employeeCode: profile.employeeCode.trim(),
        mobile: profile.mobile.trim(),
      })
    );
  } catch {
    // Not remembered — they'll just see the form next time.
  }
}

export function clearGymProfile(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
