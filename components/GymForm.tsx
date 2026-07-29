"use client";

import { useState } from "react";

interface Props {
  onSubmit: (input: {
    name: string;
    employeeCode: string;
    mobile: string;
  }) => Promise<void>;
}

export default function GymForm({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Name is required.");
    if (!employeeCode.trim()) return setError("Employee code is required.");
    if (!mobile.trim()) return setError("Mobile number is required.");
    setBusy(true);
    try {
      await onSubmit({ name, employeeCode, mobile });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="gym-name"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Name<span className="text-red-500"> *</span>
        </label>
        <input
          id="gym-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          required
        />
      </div>

      <div>
        <label
          htmlFor="gym-code"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Employee Code<span className="text-red-500"> *</span>
        </label>
        <input
          id="gym-code"
          type="text"
          value={employeeCode}
          onChange={(e) => setEmployeeCode(e.target.value)}
          placeholder="e.g. EMP1234"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          required
        />
      </div>

      <div>
        <label
          htmlFor="gym-mobile"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Mobile No<span className="text-red-500"> *</span>
        </label>
        <input
          id="gym-mobile"
          type="tel"
          inputMode="numeric"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="10-digit number"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          required
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
        {busy ? "Submitting…" : "Submit gym entry"}
      </button>
    </form>
  );
}
