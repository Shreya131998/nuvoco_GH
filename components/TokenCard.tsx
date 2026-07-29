"use client";

import { useState } from "react";

interface Props {
  token: string;
  onDone: () => void;
}

/** Big, copyable token shown after a successful check-in. */
export default function TokenCard({ token, onDone }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be blocked; the token is visible to copy manually.
    }
  }

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
        You&apos;re checked in!
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Save this token — you&apos;ll need it to punch out when you leave.
      </p>

      <div className="mt-5 rounded-xl border-2 border-dashed border-brand-200 bg-brand-50 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
          Your token
        </p>
        <p className="mt-1 select-all font-mono text-4xl font-bold tracking-widest text-brand-700">
          {token}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          onClick={copy}
          className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          {copied ? "Copied ✓" : "Copy token"}
        </button>
        <button
          onClick={onDone}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          New check-in
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Tip: take a screenshot so you don&apos;t lose it.
      </p>
    </div>
  );
}
