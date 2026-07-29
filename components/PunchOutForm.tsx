"use client";

import { useState } from "react";

interface PublicVisitor {
  token: string;
  name: string;
  room: string;
  punchIn: string;
  punchOut: string;
}

/** Token-based punch out for departing visitors. */
export default function PunchOutForm() {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<PublicVisitor | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const value = token.trim();
    if (!value) return setError("Please enter your token.");

    setBusy(true);
    try {
      const res = await fetch("/api/punch-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not punch out.");
        return;
      }
      setDone(data.visitor as PublicVisitor);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setToken("");
    setDone(null);
    setError("");
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 13l4 4L19 7"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          Punched out — safe travels!
        </h2>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm">
          <Row label="Token" value={done.token} />
          <Row label="Name" value={done.name} />
          {done.room && <Row label="Room" value={done.room} />}
          <Row label="Punched in" value={done.punchIn} />
          <Row label="Punched out" value={done.punchOut} />
        </div>
        <button
          onClick={reset}
          className="mt-5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="punch-token"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Enter your token
        </label>
        <input
          id="punch-token"
          value={token}
          onChange={(e) => setToken(e.target.value.toUpperCase())}
          placeholder="GH-042"
          autoComplete="off"
          className="w-full rounded-lg border border-slate-300 px-3 py-3 text-center font-mono text-2xl font-bold tracking-widest uppercase shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
      >
        {busy ? "Punching out…" : "Punch out"}
      </button>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
