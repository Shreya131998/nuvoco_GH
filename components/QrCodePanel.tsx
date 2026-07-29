"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface Props {
  /** Path on this site the QR should open, e.g. "/" or "/gym". */
  path: string;
  title: string;
  description: string;
  /** Download filename, e.g. "guesthouse-qr.png". */
  filename: string;
}

export default function QrCodePanel({
  path,
  title,
  description,
  filename,
}: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    const full = `${window.location.origin}${path}`;
    setUrl(full);
    QRCode.toDataURL(full, { width: 512, margin: 2 })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [open, path]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {open ? "Hide QR" : "Show QR"}
        </button>
      </div>

      {open && (
        <div className="mt-4 flex flex-col items-center gap-3 border-t border-slate-100 pt-4">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt={`${title} QR code`}
              className="h-52 w-52 rounded-lg border border-slate-200"
            />
          ) : (
            <div className="flex h-52 w-52 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
              Generating…
            </div>
          )}

          <p className="break-all text-center text-xs text-slate-500">{url}</p>

          <div className="flex gap-2">
            <a
              href={dataUrl || undefined}
              download={filename}
              className={`rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 ${
                dataUrl ? "" : "pointer-events-none opacity-50"
              }`}
            >
              Download PNG
            </a>
            <button
              onClick={() => window.print()}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Print
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
