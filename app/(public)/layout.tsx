import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import SidebarLayout from "@/components/SidebarLayout";

/** Shared shell for the public visitor pages (/visitor and /gym). */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarLayout
      title="Nuvoco"
      badge="Visitor"
      nav={<PublicNav />}
      footer={
        <Link
          href="/admin"
          className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          🔒 Admin login
        </Link>
      }
    >
      <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
    </SidebarLayout>
  );
}
