"use client";

export default function GymSuccess({
  entry,
  onDone,
}: {
  entry: { entryNo: string; time: string };
  onDone: () => void;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-3xl">
        ✅
      </div>
      <h2 className="text-lg font-semibold text-slate-900">Gym entry recorded</h2>
      <p className="mt-1 text-sm text-slate-500">
        Your visit has been logged. Enjoy your workout!
      </p>

      <div className="mx-auto mt-5 max-w-xs rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Entry No
        </p>
        <p className="font-mono text-2xl font-bold text-brand-700">
          {entry.entryNo}
        </p>
        <p className="mt-1 text-xs text-slate-500">{entry.time}</p>
      </div>

      <button
        onClick={onDone}
        className="mt-6 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        New entry
      </button>
    </div>
  );
}
