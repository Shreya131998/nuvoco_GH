"use client";

import { useState } from "react";
import GymForm from "@/components/GymForm";
import GymSuccess from "@/components/GymSuccess";

export default function GymPublicPage() {
  const [gymEntry, setGymEntry] = useState<
    { entryNo: string; time: string } | null
  >(null);

  async function handleGymEntry(input: { name: string; employeeCode: string }) {
    const res = await fetch("/api/gym", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Could not submit entry.");
    setGymEntry({ entryNo: data.entryNo as string, time: data.time as string });
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
        ) : (
          <GymForm onSubmit={handleGymEntry} />
        )}
      </div>
    </>
  );
}
