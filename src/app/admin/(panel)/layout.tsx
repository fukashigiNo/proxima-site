import { Logo } from "@/presentation/components/brand/Logo";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { container } from "@/infrastructure/container";
import { AdminNav } from "@/presentation/components/admin/AdminNav";
import { ThemeToggle } from "@/presentation/theme/ThemeToggle";
import { logout } from "../actions";
import { requireAdmin } from "../auth";

export const metadata: Metadata = { title: "Proxima Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  const { byStatus } = await container.admin.getDashboard.execute();

  return (
    <div className="min-h-dvh bg-surface md:grid md:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-10 flex flex-col gap-4 border-b border-line bg-bg p-4 md:h-dvh md:border-b-0 md:border-r md:p-5">
        <div className="flex items-center justify-between gap-2">
          <Link href="/admin" className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em] text-ink no-underline">
            <Logo className="h-8" title="PRX comp" /> Admin
          </Link>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
        <AdminNav newRequests={byStatus.new} />
        <div className="mt-auto hidden gap-2 md:grid">
          <Link href="/" className="rounded-card px-3.5 py-2 text-sm text-muted no-underline hover:text-ink">
            ← На сайт
          </Link>
          <div className="flex items-center justify-between gap-2">
            <form action={logout}>
              <button className="rounded-card px-3.5 py-2 text-sm text-muted hover:text-danger">Выйти</button>
            </form>
            <ThemeToggle />
          </div>
        </div>
      </aside>
      <main className="min-w-0 p-4 md:p-8">{children}</main>
    </div>
  );
}
