import Link from "next/link";
import { REQUEST_CHANNEL_LABELS, REQUEST_STATUSES, REQUEST_STATUS_LABELS, channelOf, type RequestStatus } from "@/domain/entities/BuildRequest";
import { CATEGORY_LABELS } from "@/domain/entities/PcComponent";
import { container } from "@/infrastructure/container";
import { ChannelBadge, requestTitle } from "@/presentation/components/admin/ChannelBadge";
import { StatusBadge } from "@/presentation/components/admin/StatusBadge";
import { StatusControl } from "@/presentation/components/admin/StatusControl";
import { cn } from "@/presentation/lib/cn";
import { formatPrice } from "@/presentation/lib/format";
import { PageTitle } from "../PageTitle";

const dateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: raw } = await searchParams;
  const status = REQUEST_STATUSES.includes(raw as RequestStatus) ? (raw as RequestStatus) : undefined;
  const [requests, all] = await Promise.all([
    container.admin.listBuildRequests.execute({ status }),
    container.admin.listBuildRequests.execute(),
  ]);
  const count = (s?: RequestStatus) => (s ? all.filter((r) => r.status === s).length : all.length);

  return (
    <>
      <PageTitle title="Заявки" description="Заявки с формы на сайте и переходы в Telegram / WhatsApp" />

      <div className="mb-4 flex flex-wrap gap-2">
        {[undefined, ...REQUEST_STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/admin/requests?status=${s}` : "/admin/requests"}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] no-underline transition-colors",
              status === s ? "border-ink bg-ink text-bg" : "border-line-strong bg-bg text-ink hover:border-ink",
            )}
          >
            {s ? REQUEST_STATUS_LABELS[s] : "Все"} <span className="opacity-60">{count(s)}</span>
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <p className="rounded-panel border border-dashed border-line-strong bg-bg p-10 text-center text-sm text-muted">
          Здесь пока пусто.
        </p>
      ) : (
        <div className="grid gap-3">
          {requests.map((r) => (
            <details key={r.id} id={r.id} open={r.status === "new"} className="group scroll-mt-6 rounded-panel border border-line bg-bg target:border-accent">
              <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-4 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto_auto] [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium">{requestTitle(r)}</span>
                    <ChannelBadge request={r} />
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {r.id} · {dateFormat.format(new Date(r.createdAt))}
                  </span>
                </span>
                <span className="hidden truncate text-sm sm:block">{r.contact || REQUEST_CHANNEL_LABELS[channelOf(r)]}</span>
                <span className="font-mono text-sm">{r.summary ? formatPrice(r.summary.total) : "—"}</span>
                <StatusBadge status={r.status} />
              </summary>

              <div className="grid gap-5 border-t border-line px-5 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                <dl className="grid content-start gap-3 text-sm">
                  {r.contact ? (
                    <div>
                      <dt className="text-xs text-muted">Контакт</dt>
                      <dd className="select-all">{r.contact}</dd>
                    </div>
                  ) : (
                    <div>
                      <dt className="text-xs text-muted">Контакт</dt>
                      <dd>
                        Клиент перешёл в {REQUEST_CHANNEL_LABELS[channelOf(r)]}. Найдите в чате сообщение с кодом{" "}
                        <span className="select-all font-mono font-medium">{r.id}</span>.
                        <span className="mt-1 block text-xs text-muted">Если сообщения нет — клиент передумал отправлять.</span>
                      </dd>
                    </div>
                  )}
                  {r.buildTitle && (
                    <div>
                      <dt className="text-xs text-muted">Сборка</dt>
                      <dd>{r.buildTitle}</dd>
                    </div>
                  )}
                  {r.budget !== undefined && (
                    <div>
                      <dt className="text-xs text-muted">Бюджет</dt>
                      <dd>{formatPrice(r.budget)}</dd>
                    </div>
                  )}
                  {r.comment && (
                    <div>
                      <dt className="text-xs text-muted">Комментарий</dt>
                      <dd className="whitespace-pre-line">{r.comment}</dd>
                    </div>
                  )}
                  {r.updatedAt && (
                    <div>
                      <dt className="text-xs text-muted">Обновлена</dt>
                      <dd>{dateFormat.format(new Date(r.updatedAt))}</dd>
                    </div>
                  )}
                  <div className="pt-2">
                    <dt className="mb-2 text-xs text-muted">Действия</dt>
                    <dd>
                      <StatusControl id={r.id} status={r.status} />
                    </dd>
                  </div>
                </dl>

                <div className="min-w-0">
                  <p className="mb-2 text-xs text-muted">Конфигурация</p>
                  {r.components.length === 0 ? (
                    <p className="text-sm text-muted">Клиент не приложил конфигурацию.</p>
                  ) : (
                    <>
                      <ul className="divide-y divide-line rounded-card border border-line text-sm">
                        {r.components.map((c) => (
                          <li key={c.id} className="flex justify-between gap-3 px-3.5 py-2">
                            <span className="min-w-0 truncate">
                              <span className="text-muted">{CATEGORY_LABELS[c.category]}:</span> {c.brand} {c.name}
                            </span>
                            <span className="shrink-0 font-mono text-xs">{formatPrice(c.price)}</span>
                          </li>
                        ))}
                      </ul>
                      {r.summary && r.summary.issues.length > 0 && (
                        <ul className="mt-3 grid gap-1 text-xs">
                          {r.summary.issues.map((i) => (
                            <li key={i.rule} className={i.severity === "error" ? "text-danger" : "text-warning-ink"}>
                              {i.message}
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="mt-3 text-right text-xs text-muted">Цены — по текущему каталогу</p>
                    </>
                  )}
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
