"use client";

export interface Stats {
  total: number;
  inHouse: number;
  roomsOccupied: number;
  checkInsToday: number;
  punchOutsToday: number;
  checkedOut: number;
}

const CARDS: {
  key: keyof Stats;
  label: string;
  accent: string;
}[] = [
  { key: "roomsOccupied", label: "Rooms occupied now", accent: "text-brand-700" },
  { key: "inHouse", label: "Guests in-house now", accent: "text-emerald-600" },
  { key: "checkInsToday", label: "Visitors today", accent: "text-sky-600" },
  { key: "punchOutsToday", label: "Punch-outs today", accent: "text-amber-600" },
  { key: "total", label: "Total visitors", accent: "text-slate-700" },
];

export default function StatCards({ stats }: { stats: Stats | null }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CARDS.map((c) => (
        <div
          key={c.key}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-medium text-slate-500">{c.label}</p>
          <p className={`mt-1 text-3xl font-bold ${c.accent}`}>
            {stats ? stats[c.key] : "—"}
          </p>
        </div>
      ))}
    </div>
  );
}
