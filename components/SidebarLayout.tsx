"use client";

import { useState } from "react";

interface Props {
  title: string;
  badge: string;
  nav: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Responsive app shell. On desktop (md+) the sidebar is a static left column.
 * On mobile it is hidden off-canvas and opened via the ☰ button in the top bar
 * (closed by the ✕, by tapping the backdrop, or by tapping any item inside it).
 */
export default function SidebarLayout({
  title,
  badge,
  nav,
  footer,
  children,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 md:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg border border-slate-300 p-1.5 text-slate-700 transition hover:bg-slate-50"
        >
          <MenuIcon />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-900">{title}</span>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
            {badge}
          </span>
        </div>
      </header>

      {/* Backdrop (mobile, when open) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar — off-canvas on mobile, static on desktop */}
      <aside
        onClick={() => setOpen(false)}
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out md:static md:z-auto md:w-60 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-900">{title}</span>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
              {badge}
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 md:hidden"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">{nav}</div>

        {footer && (
          <div className="border-t border-slate-100 px-3 py-4">{footer}</div>
        )}
      </aside>

      {/* Main content (padded below the mobile top bar) */}
      <div className="min-w-0 flex-1 pt-14 md:pt-0">{children}</div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
