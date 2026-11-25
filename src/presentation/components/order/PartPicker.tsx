"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { evaluateCandidate } from "@/application/use-cases/EvaluateBuild";
import type { Catalog } from "@/application/use-cases/GetCatalog";
import { removeCategory } from "@/domain/entities/Build";
import { CATEGORY_LABELS, COMPONENT_CATEGORIES, type ComponentCategory, type PcComponent } from "@/domain/entities/PcComponent";
import { cn } from "@/presentation/lib/cn";
import { formatPrice } from "@/presentation/lib/format";
import { useBuild } from "@/presentation/state/BuildContext";
import { Button } from "../ui/Button";

export interface PartPickerHandle {
  open: (category?: ComponentCategory) => void;
}

const STATUS_TEXT = { ok: "Подходит", warning: "С оговорками", error: "Не подойдёт" } as const;

export const PartPicker = forwardRef<PartPickerHandle, { catalog: Catalog }>(function PartPicker({ catalog }, ref) {
  const dialog = useRef<HTMLDialogElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const { selection, summary, select, remove } = useBuild();
  const tabs = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<ComponentCategory>("cpu");
  const [opened, setOpened] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      tabs.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [category, opened]);

  useImperativeHandle(ref, () => ({
    open: (next) => {
      if (next) setCategory(next);
      dialog.current?.showModal();
      setOpened((n) => n + 1);
    },
  }));

  const switchTo = (next: ComponentCategory) => {
    setCategory(next);
    list.current?.scrollTo({ top: 0 });
  };

  const rest = useMemo(() => removeCategory(selection, category), [selection, category]);
  const offers = catalog[category] as PcComponent[];
  const current = selection[category];
  const index = COMPONENT_CATEGORIES.indexOf(category);
  const next = COMPONENT_CATEGORIES[index + 1];

  const pick = (offer: PcComponent) => {
    if (current?.id === offer.id) return remove(category);
    select(offer);
    if (next && !selection[next]) window.setTimeout(() => switchTo(next), 220);
  };

  return (
    <dialog
      ref={dialog}
      data-lenis-prevent=""
      aria-labelledby="part-picker-title"
      className="order-dialog m-auto h-[min(760px,calc(100dvh-24px))] w-[min(640px,calc(100vw-24px))] max-w-none overflow-hidden bg-transparent p-0 text-ink outline-none"
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
    >
      <div className="grid h-full grid-rows-[auto_auto_minmax(0,1fr)_auto] rounded-panel border border-line bg-surface shadow-float">
        <div className="relative grid gap-1 px-6 pb-3 pt-6 sm:px-8">
          <h2 id="part-picker-title" className="pr-10 text-[22px] font-semibold leading-tight tracking-[-0.03em]">
            {CATEGORY_LABELS[category]}
          </h2>
          <p className="text-sm text-muted">Выберите деталь, совместимость проверяется сразу.</p>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-line-strong hover:text-ink"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div ref={tabs} className="flex gap-1.5 overflow-x-auto border-b border-line px-6 pb-3 [scrollbar-width:none] sm:px-8" role="tablist">
          {COMPONENT_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={c === category}
              onClick={() => switchTo(c)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors",
                c === category ? "border-accent bg-accent/10 text-ink" : "border-line text-muted hover:border-line-strong hover:text-ink",
              )}
            >
              <span className={cn("size-1.5 rounded-full", selection[c] ? "bg-success" : "bg-line-strong")} aria-hidden />
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        <div ref={list} className="grid content-start gap-2 overflow-y-auto overscroll-contain px-6 py-4 sm:px-8" role="radiogroup" aria-label={CATEGORY_LABELS[category]}>
          {offers.length === 0 && <p className="py-8 text-center text-sm text-muted">Сейчас нет позиций в этой категории.</p>}
          {offers.map((offer) => {
            const checked = current?.id === offer.id;
            const { status, reasons } = evaluateCandidate(rest, offer);
            return (
              <button
                key={offer.id}
                type="button"
                role="radio"
                aria-checked={checked}
                data-status={status}
                onClick={() => pick(offer)}
                className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-card border border-line bg-bg/50 px-4 py-3 text-left transition-[border-color,opacity] hover:border-line-strong aria-checked:border-accent aria-checked:bg-surface-2 data-[status=error]:not-aria-checked:opacity-55"
              >
                <span className="mt-1 size-4 rounded-full border-[1.5px] border-line-strong transition-[border] group-aria-checked:border-[5px] group-aria-checked:border-accent" aria-hidden />
                <span className="grid min-w-0 gap-0.5">
                  <span className="text-[15px] font-medium">
                    <span className="font-normal text-muted">{offer.brand}</span> {offer.name}
                  </span>
                  <span className="truncate text-[12px] text-muted">{Object.values(offer.specs).join(" · ")}</span>
                  {status !== "ok" && (
                    <span className="text-[12px] group-data-[status=error]:text-danger group-data-[status=warning]:text-warning-ink">{reasons[0]}</span>
                  )}
                </span>
                <span className="grid justify-items-end gap-0.5">
                  <span className="whitespace-nowrap font-mono text-sm">{formatPrice(offer.price)}</span>
                  <span className="text-[10px] uppercase tracking-[0.04em] text-success group-data-[status=error]:text-danger group-data-[status=warning]:text-warning-ink">
                    {STATUS_TEXT[status]}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-4 sm:px-8">
          <div className="grid">
            <span className="text-[22px] font-semibold tracking-[-0.02em]">{formatPrice(summary.total)}</span>
            <span className="text-[12px] text-muted">
              {summary.isValid
                ? "Сборка совместима"
                : summary.missing.length
                  ? `Осталось выбрать: ${summary.missing.length}`
                  : "Есть несовместимые детали"}
            </span>
          </div>
          <div className="flex gap-2">
            {next && (
              <Button type="button" variant="ghost" onClick={() => switchTo(next)}>
                Дальше →
              </Button>
            )}
            <Button type="button" onClick={() => dialog.current?.close()}>
              Готово
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
});
