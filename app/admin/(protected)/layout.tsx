import { getSessionEmail } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";

export const dynamic = "force-dynamic";

/**
 * Shell for the authenticated admin area. Login lives at /admin/login (a sibling
 * outside this route group) so it never inherits this guard — no redirect loop.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await getSessionEmail();
  if (!email) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <Link href="/admin" className="text-lg font-bold text-slate-900">
            Nuvoco
          </Link>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
            Admin
          </span>
        </div>

        <div className="flex-1 px-3 py-4">
          <AdminNav />
        </div>

        <div className="border-t border-slate-100 px-4 py-4">
          <p className="mb-2 truncate text-xs text-slate-500" title={email}>
            {email}
          </p>
          <form action="/api/logout" method="post">
            <button className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
