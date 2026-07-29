"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import QrCodePanel from "@/components/QrCodePanel";

interface GymEntry {
  rowNumber: number;
  entryNo: string;
  name: string;
  employeeCode: string;
  time: string;
  enteredBy: string;
  mobile: string;
}

interface GymStats {
  total: number;
  today: number;
}

export default function GymDashboard() {
  const [entries, setEntries] = useState<GymEntry[]>([]);
  const [stats, setStats] = useState<GymStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/gym");
      if (!res.ok) throw new Error("Failed to load gym entries.");
      const data = await res.json();
      setEntries(data.entries ?? []);
      setStats(data.stats ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      [e.entryNo, e.name, e.employeeCode, e.mobile]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [entries, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gym</h1>
          <p className="text-sm text-slate-500">Employee gym attendance log</p>
        </div>
        <button
          onClick={load}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <StatCard label="Entries today" value={stats?.today} accent="text-sky-600" />
        <StatCard label="Total entries" value={stats?.total} accent="text-slate-700" />
      </div>

      <QrCodePanel
        path="/gym"
        title="Gym visitor QR"
        description="Print this at the gym — employees scan it to log entry."
        filename="gym-visitor-qr.png"
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-400">
          Loading gym entries…
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Gym entries
              </h2>
              <p className="text-xs text-slate-500">Newest first</p>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, employee code, mobile, entry no…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:max-w-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <Th>Entry No</Th>
                  <Th>Name</Th>
                  <Th>Employee Code</Th>
                  <Th>Mobile</Th>
                  <Th>Time</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      {entries.length === 0
                        ? "No gym entries yet."
                        : "No entries match your search."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <tr key={e.rowNumber} className="hover:bg-slate-50/60">
                      <Td className="font-mono font-semibold text-brand-700">
                        {e.entryNo}
                      </Td>
                      <Td className="font-medium text-slate-800">{e.name}</Td>
                      <Td>{e.employeeCode}</Td>
                      <Td>{e.mobile}</Td>
                      <Td className="whitespace-nowrap text-slate-500">
                        {e.time}
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
            {entries.length} total {entries.length === 1 ? "entry" : "entries"}
            {query && ` · showing ${filtered.length} matching`}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | undefined;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent}`}>
        {value ?? "—"}
      </p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
