"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { evaluateBuild } from "@/application/use-cases/EvaluateBuild";
import { selectedComponents, type BuildSelection } from "@/domain/entities/Build";
import type { MessengerChannel } from "@/domain/entities/BuildRequest";
import { CONTACTS, telegramLink, whatsappLink } from "@/presentation/content/contacts";
import { cn } from "@/presentation/lib/cn";
import { formatPrice } from "@/presentation/lib/format";
import { buildOrderMessage, buildPartMessage } from "@/presentation/lib/orderMessage";
import { reportMessengerOrder } from "@/presentation/lib/api";
import { orderHref } from "@/presentation/lib/routes";

interface OrderDraft {
  selection: BuildSelection;
  title: string | null;
  part?: boolean;
}

const newReference = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `PX-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
};

const OrderModalContext = createContext<((draft: OrderDraft) => void) | null>(null);

export function useOrderModal() {
  const open = useContext(OrderModalContext);
  if (!open) throw new Error("useOrderModal must be used inside <OrderModalProvider>");
  return open;
}

export function OrderModalProvider({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<OrderDraft | null>(null);

  const open = useCallback((next: OrderDraft) => {
    setDraft(next);
    dialog.current?.showModal();
  }, []);

  return (
    <OrderModalContext.Provider value={open}>
      {children}
      <dialog
        ref={dialog}
        data-lenis-prevent=""
        aria-labelledby="order-modal-title"
        className="order-dialog m-auto max-h-[calc(100dvh-24px)] w-[min(520px,calc(100vw-24px))] max-w-none overflow-y-auto overscroll-contain bg-transparent p-0 text-ink outline-none"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        {draft && <OrderModalContent draft={draft} onClose={() => dialog.current?.close()} />}
      </dialog>
    </OrderModalContext.Provider>
  );
}

function OrderModalContent({ draft, onClose }: { draft: OrderDraft; onClose: () => void }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [reference, setReference] = useState("");
  const reported = useRef(false);
  useEffect(() => setOrigin(window.location.origin), []);
  useEffect(() => {
    setReference(newReference());
    reported.current = false;
  }, [draft]);

  const summary = useMemo(() => evaluateBuild(draft.selection), [draft.selection]);
  const parts = selectedComponents(draft.selection);
  const message = useMemo(
    () =>
      draft.part
        ? buildPartMessage(draft.selection, origin, reference || undefined)
        : buildOrderMessage(draft.selection, draft.title, origin, reference || undefined),
    [draft, origin, reference],
  );

  const report = (channel: MessengerChannel) => {
    if (reported.current || !reference) return;
    reported.current = true;
    reportMessengerOrder({
      channel,
      reference,
      componentIds: parts.map((p) => p.id),
      buildTitle: draft.title ?? undefined,
    });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const channels = [
    {
      key: "telegram" as const,
      label: "Telegram",
      hint: CONTACTS.telegram ? `@${CONTACTS.telegram}` : "не настроен",
      href: CONTACTS.telegram ? telegramLink(CONTACTS.telegram, message) : null,
      icon: <TelegramIcon />,
      tone: "bg-[#2aabee]",
    },
    {
      key: "whatsapp" as const,
      label: "WhatsApp",
      hint: CONTACTS.whatsapp ? `+${CONTACTS.whatsapp}` : "не настроен",
      href: CONTACTS.whatsapp ? whatsappLink(CONTACTS.whatsapp, message) : null,
      icon: <WhatsAppIcon />,
      tone: "bg-[#25d366]",
    },
  ];

  return (
    <div className="relative grid gap-6 rounded-panel border border-line bg-surface p-6 shadow-float sm:p-8">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-line-strong hover:text-ink"
        aria-label="Закрыть"
      >
        ✕
      </button>

      <div className="grid gap-2 pr-10">
                <h2 id="order-modal-title" className="text-[26px] font-semibold leading-tight tracking-[-0.03em]">
          Куда отправить заказ?
        </h2>
        <p className="text-sm text-muted">
          {reference && <span className="mr-2 font-mono text-accent-2">{reference}</span>}
          {parts.length > 0
            ? draft.part
              ? `${draft.title ?? parts.map((p) => p.name).join(", ")} · ${formatPrice(parts.reduce((sum, p) => sum + p.price, 0))}`
              : `${draft.title ?? "Своя конфигурация"} · ${parts.length} поз. · ${formatPrice(summary.total)}`
            : "Опишите задачу — подберём конфигурацию"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {channels.map((channel, i) =>
          channel.href ? (
            <a
              key={channel.key}
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                report(channel.key);
                window.setTimeout(onClose, 300);
              }}
              className="order-option group flex items-center gap-4 rounded-card border border-line bg-bg/60 p-4 text-ink no-underline transition-[border-color,translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-float"
              style={{ animationDelay: `${120 + i * 70}ms` }}
            >
              <span className={cn("grid size-12 shrink-0 place-items-center rounded-full text-white transition-transform duration-300 group-hover:scale-110", channel.tone)}>
                {channel.icon}
              </span>
              <span className="grid min-w-0">
                <span className="font-semibold">{channel.label}</span>
                <span className="truncate font-mono text-xs text-muted">{channel.hint}</span>
              </span>
              <span className="ml-auto text-muted transition-transform group-hover:translate-x-1" aria-hidden>
                ↗
              </span>
            </a>
          ) : (
            <span
              key={channel.key}
              className="order-option flex items-center gap-4 rounded-card border border-dashed border-line p-4 opacity-50"
              style={{ animationDelay: `${120 + i * 70}ms` }}
              title="Укажите контакт в переменных окружения"
            >
              <span className={cn("grid size-12 shrink-0 place-items-center rounded-full text-white grayscale", channel.tone)}>{channel.icon}</span>
              <span className="grid">
                <span className="font-semibold">{channel.label}</span>
                <span className="font-mono text-xs text-muted">{channel.hint}</span>
              </span>
            </span>
          ),
        )}
      </div>

      <details className="group rounded-card border border-line bg-bg/40">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm text-muted [&::-webkit-details-marker]:hidden">
          Текст сообщения
          <span className="transition-transform group-open:rotate-180" aria-hidden>
            ▾
          </span>
        </summary>
        <div className="grid gap-3 px-4 pb-4">
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-bg/70 p-3 font-mono text-[12px] leading-relaxed text-muted">
            {message}
          </pre>
          <button
            type="button"
            onClick={copy}
            className="justify-self-start rounded-full border border-line-strong px-4 py-2 text-sm transition-colors hover:border-accent"
          >
            {copied ? "Скопировано ✓" : "Скопировать"}
          </button>
        </div>
      </details>

      <p className="text-center text-sm text-muted">
        Удобнее форма?{" "}
        <Link href={orderHref(draft.selection, draft.title)} onClick={onClose} className="text-ink underline-offset-4 hover:text-accent">
          Оставить заявку на сайте →
        </Link>
      </p>
    </div>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      <path d="M21 4 3 11.2l6.2 2.3L11.5 20l3.3-4.3L19 19z" />
      <path d="m9.2 13.5 7.3-5.6-5 7.8" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      <path d="M4 20l1.2-3.8A8 8 0 1 1 8.1 19z" />
      <path d="M9 8.5c0 3.5 2.5 6.5 6 6.5l1-1.5-2-1-1 1c-1-.4-2.6-2-3-3l1-1-1-2z" fill="currentColor" stroke="none" />
    </svg>
  );
}
