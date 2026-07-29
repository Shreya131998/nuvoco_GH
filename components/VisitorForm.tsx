"use client";

import { useState } from "react";
import { FIELDS, EMPTY_INPUT, type VisitorInput } from "@/lib/validation";

interface Props {
  initial?: Partial<VisitorInput>;
  submitLabel: string;
  onSubmit: (input: VisitorInput) => Promise<void>;
}

export default function VisitorForm({ initial, submitLabel, onSubmit }: Props) {
  const [values, setValues] = useState<VisitorInput>(() => ({
    ...EMPTY_INPUT,
    ...initial,
  }));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set<K extends keyof VisitorInput>(key: K, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!values.name.trim()) return setError("Visitor name is required.");
    if (!values.mobile.trim()) return setError("Mobile number is required.");
    setBusy(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => {
          const isWide = f.type === "textarea";
          return (
            <div key={f.key} className={isWide ? "sm:col-span-2" : ""}>
              <label
                htmlFor={f.key}
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                {f.label}
                {f.required && <span className="text-red-500"> *</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  id={f.key}
                  value={values[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              ) : (
                <input
                  id={f.key}
                  type={f.type}
                  inputMode={f.type === "tel" ? "numeric" : undefined}
                  value={values[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  required={f.required}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              )}
            </div>
          );
        })}
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
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
