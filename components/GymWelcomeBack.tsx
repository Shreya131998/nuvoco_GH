"use client";

import { useEffect, useState } from "react";
import type { GymProfile } from "@/lib/gymProfile";

/** One-tap check-in for a member whose details are remembered on this phone. */
export default function GymWelcomeBack({
  profile,
  onCheckIn,
  onNotMe,
}: {
  profile: GymProfile;
  onCheckIn: () => Promise<void>;
  onNotMe: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const firstName = profile.name.trim().split(/\s+/)[0];
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/gym/streak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeCode: profile.employeeCode,
        mobile: profile.mobile,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && typeof data?.streak === "number") setStreak(data.streak);
      })
      .catch(() => {
        // Streak is a nice-to-have; check-in still works without it.
      });
    return () => {
      cancelled = true;
    };
  }, [profile.employeeCode, profile.mobile]);

  async function handleClick() {
    setError("");
    setBusy(true);
    try {
      await onCheckIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-3xl">
        💪
      </div>
      <h2 className="text-lg font-semibold text-slate-900">
        Welcome back, {firstName}!
      </h2>
      <p className="mt-1 text-sm text-slate-500">Tap below to check in.</p>

      {streak !== null && streak > 0 && (
        <p className="mx-auto mt-3 inline-block rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600">
          🔥 {streak}-day streak — don&apos;t break it!
        </p>
      )}

      <div className="mx-auto mt-5 max-w-xs rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm">
        <Row label="Name" value={profile.name} />
        <Row label="Employee Code" value={profile.employeeCode} />
        <Row label="Mobile" value={profile.mobile} />
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        onClick={handleClick}
        disabled={busy}
        className="mt-6 w-full rounded-lg bg-brand-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
      >
        {busy ? "Checking in…" : "Check in"}
      </button>

      <button
        onClick={onNotMe}
        disabled={busy}
        className="mt-3 text-sm font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
      >
        Not {firstName}? Enter different details
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-0.5">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
