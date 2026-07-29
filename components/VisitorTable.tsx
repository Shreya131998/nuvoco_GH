"use client";

import { useMemo, useState } from "react";
import type { Visitor } from "@/lib/sheets";

interface Props {
  /** Already filtered to in-house guests by the caller. */
  visitors: Visitor[];
  busyToken: string | null;
  onEdit: (v: Visitor) => void;
  onPunchOut: (v: Visitor) => void;
}

export default function VisitorTable({
  visitors,
  busyToken,
  onEdit,
  onPunchOut,
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visitors;
    return visitors.filter((v) =>
      [v.token, v.name, v.company, v.mobile, v.room, v.designation]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [visitors, query]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Currently in-house
          </h2>
          <p className="text-xs text-slate-500">
            Guests who have not punched out yet
          </p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, company, mobile, token, room…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:max-w-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <Th>Token</Th>
              <Th>Name</Th>
              <Th>Company</Th>
              <Th>Room</Th>
              <Th>Mobile</Th>
              <Th>Arrival</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  {visitors.length === 0
                    ? "No guests are currently in-house."
                    : "No in-house guests match your search."}
                </td>
              </tr>
            ) : (
              filtered.map((v) => {
                const busy = busyToken === v.token;
                return (
                  <tr key={v.token} className="hover:bg-slate-50/60">
                    <Td className="font-mono font-semibold text-brand-700">
                      {v.token}
                    </Td>
                    <Td className="font-medium text-slate-800">
                      {v.name}
                      {v.secondPerson && (
                        <span className="mt-0.5 block text-xs font-normal text-slate-400">
                          + {v.secondPerson}
                        </span>
                      )}
                    </Td>
                    <Td>{v.company || "—"}</Td>
                    <Td>
                      {v.room || "—"}
                      <span className="mt-0.5 block text-xs font-normal text-slate-400">
                        {v.secondPerson ? "2 in room" : "1 in room"}
                      </span>
                    </Td>
                    <Td>{v.mobile}</Td>
                    <Td className="whitespace-nowrap text-slate-500">
                      {v.arrival || v.punchIn}
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(v)}
                          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onPunchOut(v)}
                          disabled={busy}
                          className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
                        >
                          {busy ? "…" : "Punch out"}
                        </button>
                      </div>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
        {visitors.length} in-house{" "}
        {visitors.length === 1 ? "guest" : "guests"}
        {query && ` · showing ${filtered.length} matching`}
      </div>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={`px-4 py-3 font-medium ${className}`}>{children}</th>;
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
