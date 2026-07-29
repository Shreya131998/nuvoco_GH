import Link from "next/link";
import PublicNav from "@/components/PublicNav";

/** Shared shell for the public visitor pages (/visitor and /gym). */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-44 shrink-0 flex-col border-r border-slate-200 bg-white md:w-60">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-4">
          <span className="text-lg font-bold text-slate-900">Nuvoco</span>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
            Visitor
          </span>
        </div>

        <div className="flex-1 px-3 py-4">
          <PublicNav />
        </div>

        <div className="border-t border-slate-100 px-3 py-4">
          <Link
            href="/admin"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            🔒 Admin login
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
      </div>
    </div>
  );
}
