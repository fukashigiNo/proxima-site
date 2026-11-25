"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { evaluateBuild } from "@/application/use-cases/EvaluateBuild";
import type { PresetBuildView } from "@/application/use-cases/GetPresetBuilds";
import { selectedComponents, type BuildSelection } from "@/domain/entities/Build";
import { validateBuildRequest, type BuildRequestInput } from "@/domain/entities/BuildRequest";
import { CATEGORY_LABELS, COMPONENT_CATEGORIES } from "@/domain/entities/PcComponent";
import { submitBuildRequest } from "@/presentation/lib/api";
import { formatPrice } from "@/presentation/lib/format";
import { buildFormRequestMessage } from "@/presentation/lib/orderMessage";
import { useBuild } from "@/presentation/state/BuildContext";
import { Button } from "../ui/Button";
import { MessengerHandoff } from "./MessengerHandoff";

interface Option {
  key: string;
  title: string;
  note: string;
  selection: BuildSelection;
}

type Step =
  | { kind: "list" }
  | { kind: "detail"; option: Option }
  | { kind: "done"; option: Option; id: string; input: BuildRequestInput };

const INPUT =
  "w-full border-0 border-b border-line-strong bg-transparent py-2 text-base text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-accent aria-invalid:border-danger";

export function BuildPicker({ presets, label = "Выбрать сборку" }: { presets: readonly PresetBuildView[]; label?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { selection, presetTitle, loadPreset } = useBuild();
  const [step, setStep] = useState<Step>({ kind: "list" });

  const options = useMemo<Option[]>(() => {
    const own = selectedComponents(selection).length
      ? [{ key: "current", title: presetTitle ?? "Своя конфигурация", note: "Текущая конфигурация", selection }]
      : [];
    return [...own, ...presets.map((p) => ({ key: p.id, title: p.title, note: p.tagline, selection: p.selection }))];
  }, [presets, selection, presetTitle]);

  const open = () => {
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
          if (step.kind === "done") loadPreset(step.option.selection, step.option.title);
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
              onSent={(id, input) => setStep({ kind: "done", option: step.option, id, input })}
            />
          )}
          {step.kind === "done" && <Done step={step} onClose={close} />}
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

function OptionDetail({
  option,
  onBack,
  onSent,
}: {
  option: Option;
  onBack: () => void;
  onSent: (id: string, input: BuildRequestInput) => void;
}) {
  const summary = useMemo(() => evaluateBuild(option.selection), [option.selection]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input: BuildRequestInput = {
      name: String(data.get("name") ?? "").trim(),
      contact: String(data.get("contact") ?? "").trim(),
      comment: String(data.get("comment") ?? "").trim() || undefined,
      componentIds: selectedComponents(option.selection).map((p) => p.id),
      buildTitle: option.title,
    };
    const clientErrors = validateBuildRequest(input);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSending(true);
    setFailure(null);
    const result = await submitBuildRequest(input);
    setSending(false);
    if (result.ok) onSent(result.id, input);
    else if (result.fields) setErrors(result.fields);
    else setFailure(result.message);
  };

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
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[28px] font-semibold tracking-[-0.03em]">{formatPrice(summary.total)}</p>
        <p className={summary.isValid ? "text-sm text-success" : "text-sm text-muted"}>
          {summary.isValid ? "Полностью совместима" : "Уточним состав при звонке"}
        </p>
      </div>

      <form className="grid gap-4" onSubmit={submit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <MiniField name="name" label="Имя" error={errors.name} autoComplete="name" />
          <MiniField name="contact" label="Телефон или Telegram" error={errors.contact} autoComplete="tel" />
        </div>
        <MiniField name="comment" label="Комментарий (необязательно)" error={errors.comment} maxLength={1000} />
        {failure && <p className="text-sm text-danger">{failure}</p>}
        <Button type="submit" disabled={sending}>
          {sending ? "Отправляем…" : "Отправить заявку"}
        </Button>
      </form>
    </>
  );
}

function Done({ step, onClose }: { step: Extract<Step, { kind: "done" }>; onClose: () => void }) {
  const message = buildFormRequestMessage(
    { id: step.id, name: step.input.name, contact: step.input.contact, comment: step.input.comment },
    step.option.selection,
    step.option.title,
    typeof window === "undefined" ? "" : window.location.origin,
  );
  return (
    <div className="grid animate-rise justify-items-start gap-4" role="status">
      <span className="grid size-11 animate-pop place-items-center rounded-full bg-accent text-xl text-on-accent" aria-hidden>
        ✓
      </span>
      <h2 id="build-picker-title" className="pr-10 text-[24px] font-semibold leading-tight tracking-[-0.03em]">
        Заявка {step.id} принята
      </h2>
      <p className="text-muted">«{step.option.title}» — скоро напишем, чтобы всё уточнить.</p>
      <MessengerHandoff message={message} />
      <Button variant="ghost" onClick={onClose}>
        Готово
      </Button>
    </div>
  );
}

function MiniField({ name, label, error, ...rest }: { name: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[12px] text-muted">{label}</span>
      <input className={INPUT} name={name} aria-invalid={Boolean(error)} {...rest} />
      {error && <em className="text-[12px] not-italic text-danger">{error}</em>}
    </label>
  );
}
