"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import StatCards, { type Stats } from "@/components/StatCards";
import VisitorTable from "@/components/VisitorTable";
import VisitorForm from "@/components/VisitorForm";
import QrCodePanel from "@/components/QrCodePanel";
import type { Visitor } from "@/lib/sheets";
import type { VisitorInput } from "@/lib/validation";

export default function AdminDashboard() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyToken, setBusyToken] = useState<string | null>(null);

  // Modal: null = closed, {} = add, Visitor = edit
  const [modal, setModal] = useState<{ mode: "add" | "edit"; visitor?: Visitor } | null>(
    null
  );

  // Punch-out confirmation (custom modal — native confirm() is blocked in
  // embedded/in-app browsers, so we never use window.confirm/alert here).
  const [confirmOut, setConfirmOut] = useState<Visitor | null>(null);
  const [actionError, setActionError] = useState("");

  // Dashboard shows only guests who have not punched out yet. Checked-out
  // guests remain in the Google Sheet (full history) but are hidden here.
  const inHouse = useMemo(
    () => visitors.filter((v) => !v.punchOut),
    [visitors]
  );

  const load = useCallback(async () => {
    setError("");
    try {
      const [vRes, sRes] = await Promise.all([
        fetch("/api/visitors"),
        fetch("/api/stats"),
      ]);
      if (!vRes.ok || !sRes.ok) throw new Error("Failed to load data.");
      const vData = await vRes.json();
      const sData = await sRes.json();
      setVisitors(vData.visitors ?? []);
      setStats(sData.stats ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function doPunchOut(v: Visitor) {
    setBusyToken(v.token);
    setActionError("");
    try {
      const res = await fetch("/api/punch-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: v.token }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setActionError(d.error ?? "Could not punch out.");
        return;
      }
      setConfirmOut(null);
      await load();
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setBusyToken(null);
    }
  }

  async function handleSave(input: VisitorInput) {
    const isEdit = modal?.mode === "edit" && modal.visitor;
    const url = isEdit
      ? `/api/visitors/${encodeURIComponent(modal!.visitor!.token)}`
      : "/api/visitors";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Could not save.");
    setModal(null);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Live guest house occupancy</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Refresh
          </button>
          <button
            onClick={() => setModal({ mode: "add" })}
            className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            + Add visitor
          </button>
        </div>
      </div>

      <StatCards stats={stats} />

      <QrCodePanel
        path="/visitor"
        title="Guest House visitor QR"
        description="Print this at reception — visitors scan it to check in."
        filename="guesthouse-visitor-qr.png"
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-400">
          Loading visitors…
        </div>
      ) : (
        <VisitorTable
          visitors={inHouse}
          busyToken={busyToken}
          onEdit={(v) => setModal({ mode: "edit", visitor: v })}
          onPunchOut={(v) => {
            setActionError("");
            setConfirmOut(v);
          }}
        />
      )}

      {modal && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {modal.mode === "add" ? "Add visitor" : `Edit ${modal.visitor?.token}`}
          </h2>
          <VisitorForm
            submitLabel={modal.mode === "add" ? "Add visitor" : "Save changes"}
            initial={
              modal.visitor
                ? {
                    name: modal.visitor.name,
                    secondPerson: modal.visitor.secondPerson,
                    company: modal.visitor.company,
                    room: modal.visitor.room,
                    designation: modal.visitor.designation,
                    mobile: modal.visitor.mobile,
                    arrival: modal.visitor.arrival,
                    expectedDeparture: modal.visitor.expectedDeparture,
                    purpose: modal.visitor.purpose,
                    reference: modal.visitor.reference,
                  }
                : undefined
            }
            onSubmit={handleSave}
          />
        </Modal>
      )}

      {confirmOut && (
        <Modal onClose={() => setConfirmOut(null)}>
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            Punch out visitor
          </h2>
          <p className="text-sm text-slate-600">
            Record the departure time for{" "}
            <span className="font-semibold text-slate-900">{confirmOut.name}</span>{" "}
            <span className="font-mono text-brand-700">({confirmOut.token})</span>?
            This sets the punch-out time to now.
          </p>

          {actionError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {actionError}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setConfirmOut(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => doPunchOut(confirmOut)}
              disabled={busyToken === confirmOut.token}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {busyToken === confirmOut.token ? "Punching out…" : "Punch out"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex justify-end">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
