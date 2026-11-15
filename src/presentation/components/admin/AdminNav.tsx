"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/presentation/lib/cn";

const ITEMS = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/requests", label: "Заявки" },
  { href: "/admin/catalog", label: "Каталог" },
  { href: "/admin/presets", label: "Сборки" },
];

export function AdminNav({ newRequests }: { newRequests: number }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:grid" aria-label="Разделы админки">
      {ITEMS.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center justify-between gap-3 whitespace-nowrap rounded-card px-3.5 py-2.5 text-sm no-underline transition-colors",
              active ? "bg-ink text-bg" : "text-muted hover:bg-surface hover:text-ink",
            )}
          >
            {item.label}
            {item.href === "/admin/requests" && newRequests > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-on-accent">{newRequests}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
