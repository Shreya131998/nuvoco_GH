"use client";

import { useState } from "react";
import VisitorForm from "@/components/VisitorForm";
import TokenCard from "@/components/TokenCard";
import PunchOutForm from "@/components/PunchOutForm";
import type { VisitorInput } from "@/lib/validation";

type Tab = "checkin" | "punchout";

export default function VisitorPage() {
  const [tab, setTab] = useState<Tab>("checkin");
  const [token, setToken] = useState<string | null>(null);

  async function handleCheckIn(input: VisitorInput) {
    const res = await fetch("/api/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Could not check in.");
    setToken(data.token as string);
  }

  return (
    <>
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">SCP Guest House</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visitor check-in &amp; punch-out
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {token ? (
          <TokenCard token={token} onDone={() => setToken(null)} />
        ) : (
          <>
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
              <TabButton
                active={tab === "checkin"}
                onClick={() => setTab("checkin")}
              >
                Check In
              </TabButton>
              <TabButton
                active={tab === "punchout"}
                onClick={() => setTab("punchout")}
              >
                Punch Out
              </TabButton>
            </div>

            {tab === "checkin" ? (
              <VisitorForm
                submitLabel="Check in & get token"
                onSubmit={handleCheckIn}
              />
            ) : (
              <PunchOutForm />
            )}
          </>
        )}
      </div>
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-white text-brand-700 shadow-sm"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
