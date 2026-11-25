"use client";

import { useMemo, useRef, useState } from "react";
import { evaluateBuild } from "@/application/use-cases/EvaluateBuild";
import type { PresetBuildView } from "@/application/use-cases/GetPresetBuilds";
import { selectedComponents, type BuildSelection } from "@/domain/entities/Build";
import { CATEGORY_LABELS, COMPONENT_CATEGORIES } from "@/domain/entities/PcComponent";
import { formatPrice } from "@/presentation/lib/format";
import { useBuild } from "@/presentation/state/BuildContext";
import { Button } from "../ui/Button";

interface Option {
  key: string;
  title: string;
  note: string;
  selection: BuildSelection;
}

type Step = { kind: "list" } | { kind: "detail"; option: Option };

export function BuildPicker({ presets, label = "Выбрать сборку" }: { presets: readonly PresetBuildView[]; label?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const chosen = useRef<Option | null>(null);
  const { loadPreset } = useBuild();
  const [step, setStep] = useState<Step>({ kind: "list" });

  const options = useMemo<Option[]>(
    () => presets.map((p) => ({ key: p.id, title: p.title, note: p.tagline, selection: p.selection })),
    [presets],
  );

  const open = () => {
    chosen.current = null;
    setStep({ kind: "list" });
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();

  return (
    <>
      <Button type="button" variant="ghost" onClick={open}>
        {label}
      </Button>
      <dialog
        ref={dialog}
        data-lenis-prevent=""
        aria-labelledby="build-picker-title"
        onClose={() => {
          if (chosen.current) loadPreset(chosen.current.selection, chosen.current.title);
          chosen.current = null;
        }}
        className="order-dialog m-auto max-h-[calc(100dvh-24px)] w-[min(560px,calc(100vw-24px))] max-w-none overflow-y-auto overscroll-contain bg-transparent p-0 text-ink outline-none"
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="relative grid gap-5 rounded-panel border border-line bg-surface p-6 shadow-float sm:p-8">
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-line-strong hover:text-ink"
            aria-label="Закрыть"
          >
            ✕
          </button>
          {step.kind === "list" && <OptionList options={options} onPick={(option) => setStep({ kind: "detail", option })} />}
          {step.kind === "detail" && (
            <OptionDetail
              option={step.option}
              onBack={() => setStep({ kind: "list" })}
              onChoose={() => {
                chosen.current = step.option;
                close();
              }}
            />
          )}
        </div>
      </dialog>
    </>
  );
}

function OptionList({ options, onPick }: { options: Option[]; onPick: (option: Option) => void }) {
  return (
    <>
      <div className="grid gap-1.5 pr-10">
        <h2 id="build-picker-title" className="text-[24px] font-semibold leading-tight tracking-[-0.03em]">
          Какую сборку оформить?
        </h2>
        <p className="text-sm text-muted">Посмотрите состав и отправьте заявку прямо отсюда.</p>
      </div>
      {options.length === 0 ? (
        <p className="text-sm text-muted">Готовых сборок пока нет — опишите задачу в форме, подберём сами.</p>
      ) : (
        <ul className="grid gap-2.5">
          {options.map((option, i) => {
            const summary = evaluateBuild(option.selection);
            const count = selectedComponents(option.selection).length;
            return (
              <li key={option.key} className="order-option" style={{ animationDelay: `${80 + i * 50}ms` }}>
                <button
                  type="button"
                  onClick={() => onPick(option)}
                  className="group flex w-full items-center gap-4 rounded-card border border-line bg-bg/60 p-4 text-left transition-[border-color,translate] duration-300 hover:-translate-y-0.5 hover:border-line-strong"
                >
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="font-semibold">{option.title}</span>
                    <span className="truncate text-[13px] text-muted">
                      {option.note} · {count} поз.
                    </span>
                  </span>
                  <span className="whitespace-nowrap font-mono text-sm">{formatPrice(summary.total)}</span>
                  <span className="text-muted transition-transform group-hover:translate-x-1" aria-hidden>
                    →
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function OptionDetail({ option, onBack, onChoose }: { option: Option; onBack: () => void; onChoose: () => void }) {
  const summary = useMemo(() => evaluateBuild(option.selection), [option.selection]);
  return (
    <>
      <div className="grid gap-1.5 pr-10">
        <button type="button" onClick={onBack} className="justify-self-start text-sm text-muted transition-colors hover:text-ink">
          ← Все сборки
        </button>
        <h2 id="build-picker-title" className="text-[24px] font-semibold leading-tight tracking-[-0.03em]">
          {option.title}
        </h2>
      </div>

      <dl className="grid gap-2.5 border-y border-line py-4 text-[14px]">
        {COMPONENT_CATEGORIES.map((category) => {
          const part = option.selection[category];
          if (!part) return null;
          return (
            <div key={category} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4">
              <dt className="col-span-2 text-[12px] text-muted">{CATEGORY_LABELS[category]}</dt>
              <dd className="truncate">
                {part.brand} {part.name}
              </dd>
              <dd className="font-mono text-[13px] text-muted">{formatPrice(part.price)}</dd>
            </div>
          );
        })}
      </dl>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid">
          <p className="text-[28px] font-semibold tracking-[-0.03em]">{formatPrice(summary.total)}</p>
          <p className={summary.isValid ? "text-sm text-success" : "text-sm text-muted"}>
            {summary.isValid ? "Полностью совместима" : "Уточним состав при звонке"}
          </p>
        </div>
        <Button type="button" onClick={onChoose}>
          Выбрать эту сборку
        </Button>
      </div>
    </>
  );
}
