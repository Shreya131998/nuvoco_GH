"use client";

import { useEffect, useState } from "react";
import GymForm from "@/components/GymForm";
import GymSuccess from "@/components/GymSuccess";
import GymWelcomeBack from "@/components/GymWelcomeBack";
import {
  clearGymProfile,
  loadGymProfile,
  saveGymProfile,
  type GymProfile,
} from "@/lib/gymProfile";

export default function GymPublicPage() {
  const [gymEntry, setGymEntry] = useState<
    { time: string; streak?: number } | null
  >(null);
  // undefined = not read from storage yet (avoids flashing the form).
  const [profile, setProfile] = useState<GymProfile | null | undefined>(
    undefined
  );
  // Remembered details to pre-fill when a quick check-in was rejected.
  const [prefill, setPrefill] = useState<GymProfile | undefined>(undefined);

  useEffect(() => {
    setProfile(loadGymProfile());
  }, []);

  async function handleGymEntry(input: GymProfile) {
    const res = await fetch("/api/gym", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error ?? "Could not submit entry.");
      // Saved details no longer pass validation — let them fix them in the form.
      if (res.status === 400) Object.assign(err, { invalidInput: true });
      throw err;
    }
    saveGymProfile(input);
    setProfile(input);
    setPrefill(undefined);
    setGymEntry({
      time: data.time as string,
      streak: typeof data.streak === "number" ? data.streak : undefined,
    });
  }

  async function handleQuickCheckIn(p: GymProfile) {
    try {
      await handleGymEntry(p);
    } catch (err) {
      if ((err as { invalidInput?: boolean }).invalidInput) {
        clearGymProfile();
        setPrefill(p);
        setProfile(null);
      }
      throw err;
    }
  }

  function handleNotMe() {
    clearGymProfile();
    setPrefill(undefined);
    setProfile(null);
  }

  return (
    <>
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">SCP Gym</h1>
        <p className="mt-1 text-sm text-slate-500">Employee gym entry</p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {gymEntry ? (
          <GymSuccess entry={gymEntry} onDone={() => setGymEntry(null)} />
        ) : profile === undefined ? (
          <p className="py-8 text-center text-sm text-slate-400">Loading…</p>
        ) : profile ? (
          <GymWelcomeBack
            profile={profile}
            onCheckIn={() => handleQuickCheckIn(profile)}
            onNotMe={handleNotMe}
          />
        ) : (
          <>
            <GymForm initial={prefill} onSubmit={handleGymEntry} />
            <p className="mt-4 text-center text-xs text-slate-400">
              Fill this once — next time it&apos;s just one tap.
            </p>
          </>
        )}
      </div>
    </>
  );
}
