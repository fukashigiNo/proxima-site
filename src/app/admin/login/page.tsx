import { Logo } from "@/presentation/components/brand/Logo";
import type { Metadata } from "next";
import { isAdminConfigured } from "@/infrastructure/auth/credentials";
import { LoginForm } from "@/presentation/components/admin/LoginForm";

export const metadata: Metadata = { title: "Вход — Proxima Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-4">
      <div className="grid w-full max-w-sm gap-6 rounded-panel border border-line bg-bg p-8">
        <div className="grid gap-2">
          <p className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]">
            <Logo className="h-8" title="PRX comp" /> Admin
          </p>
          <p className="text-sm text-muted">Управление заявками и каталогом</p>
        </div>
        {isAdminConfigured() ? (
          <LoginForm next={next} />
        ) : (
          <p className="rounded-card bg-danger/8 p-4 text-sm text-danger">
            Админка не настроена. Задайте переменные окружения <code>ADMIN_PASSWORD</code> и{" "}
            <code>ADMIN_SESSION_SECRET</code> (не короче 32 символов) и перезапустите сервер.
          </p>
        )}
      </div>
    </main>
  );
}
