import { ChannelBadge, requestTitle } from "@/presentation/components/admin/ChannelBadge";
import Link from "next/link";
import { LOW_STOCK_THRESHOLD } from "@/application/use-cases/admin/GetDashboard";
import { totalStock } from "@/domain/entities/PcComponent";
import { container } from "@/infrastructure/container";
import { StatCard } from "@/presentation/components/admin/StatCard";
import { StatusBadge } from "@/presentation/components/admin/StatusBadge";
import { formatPrice } from "@/presentation/lib/format";
import { PageTitle } from "./PageTitle";

const dateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function DashboardPage() {
  const d = await container.admin.getDashboard.execute();

  return (
    <>
      <PageTitle title="Обзор" description="Заявки и состояние склада" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Новые заявки" value={d.byStatus.new} tone={d.byStatus.new > 0 ? "accent" : undefined} hint={`ждут ответа · ${formatPrice(d.totalByStatus.new)}`} />
        <StatCard label="В работе" value={d.byStatus.in_progress} hint={`на ${formatPrice(d.totalByStatus.in_progress)}`} />
        <StatCard label="Выполнено" value={d.byStatus.done} hint={`на ${formatPrice(d.totalByStatus.done)}`} />
        <StatCard
          label="Нет в наличии"
          value={d.outOfStock}
          tone={d.outOfStock > 0 ? "danger" : undefined}
          hint={`из ${d.catalogSize} позиций`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="rounded-panel border border-line bg-bg">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-medium">Последние заявки</h2>
            <Link href="/admin/requests" className="text-sm text-muted no-underline hover:text-ink">
              Все →
            </Link>
          </div>
          {d.recent.length === 0 ? (
            <p className="p-5 text-sm text-muted">Заявок пока нет — они появятся после отправки формы или перехода клиента в мессенджер.</p>
          ) : (
            <ul className="divide-y divide-line">
              {d.recent.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/requests#${r.id}`} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-5 py-3.5 text-ink no-underline hover:bg-surface">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-medium">{requestTitle(r)}</span>
                      <ChannelBadge request={r} />
                    </span>
                    <StatusBadge status={r.status} />
                    <span className="truncate text-xs text-muted">
                      {r.id} · {dateFormat.format(new Date(r.createdAt))}
                    </span>
                    <span className="text-right font-mono text-xs">{r.summary ? formatPrice(r.summary.total) : "без конфигурации"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-panel border border-line bg-bg">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-medium">Заканчиваются</h2>
            <span className="text-xs text-muted">меньше {LOW_STOCK_THRESHOLD} шт.</span>
          </div>
          {d.lowStock.length === 0 ? (
            <p className="p-5 text-sm text-muted">Всё в наличии.</p>
          ) : (
            <ul className="divide-y divide-line">
              {d.lowStock.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/catalog?category=${c.category}#${c.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 text-sm text-ink no-underline hover:bg-surface"
                  >
                    <span className="truncate">
                      <span className="text-muted">{c.brand}</span> {c.name}
                    </span>
                    <span className={totalStock(c) === 0 ? "shrink-0 text-danger" : "shrink-0 text-warning-ink"}>{totalStock(c)} шт.</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
