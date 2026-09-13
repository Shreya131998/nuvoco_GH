import { getSessionEmail } from "@/lib/session";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import SidebarLayout from "@/components/SidebarLayout";

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
    <SidebarLayout
      title="Nuvoco"
      badge="Admin"
      nav={<AdminNav />}
      footer={
        <div className="space-y-2">
          <p className="truncate text-xs text-slate-500" title={email}>
            {email}
          </p>
          <form action="/api/logout" method="post">
            <button className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Sign out
            </button>
          </form>
        </div>
      }
    >
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </SidebarLayout>
  );
}
