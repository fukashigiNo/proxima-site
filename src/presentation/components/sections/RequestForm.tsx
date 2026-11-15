"use client";

import { useState, type FormEvent } from "react";
import { validateBuildRequest, type BuildRequestInput } from "@/domain/entities/BuildRequest";
import { selectedComponents } from "@/domain/entities/Build";
import { submitBuildRequest, type SubmitResult } from "@/presentation/lib/api";
import { formatPrice } from "@/presentation/lib/format";
import { useBuild } from "@/presentation/state/BuildContext";
import { Button } from "../ui/Button";

const CARD = "grid gap-5 rounded-panel border border-line bg-bg p-6 md:p-9";
const INPUT =
  "w-full resize-y border-0 border-b border-line-strong bg-transparent py-2 text-base text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-ink aria-invalid:border-danger";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done"; id: string } | { kind: "failed"; message: string };

/** Форма заявки; если в контексте есть конфигурация — предлагает её приложить. */
export function RequestForm() {
  const { selection, summary, presetTitle } = useBuild();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const parts = selectedComponents(selection);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const budgetRaw = String(data.get("budget") ?? "").replace(/\s/g, "");
    const input: BuildRequestInput = {
      name: String(data.get("name") ?? ""),
      contact: String(data.get("contact") ?? ""),
      budget: budgetRaw ? Number(budgetRaw) : undefined,
      comment: String(data.get("comment") ?? "") || undefined,
      componentIds: data.get("attach") ? parts.map((p) => p.id) : [],
    };

    const clientErrors = validateBuildRequest(input);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setStatus({ kind: "sending" });
    const result: SubmitResult = await submitBuildRequest(input);
    if (result.ok) setStatus({ kind: "done", id: result.id });
    else if (result.fields) {
      setErrors(result.fields);
      setStatus({ kind: "idle" });
    } else setStatus({ kind: "failed", message: result.message });
  };

  if (status.kind === "done") {
    return (
      <div className={`${CARD} justify-items-start`} role="status">
        <span className="grid size-11 place-items-center rounded-full bg-accent text-xl text-on-accent" aria-hidden>
          ✓
        </span>
        <h2 className="text-[26px] font-medium tracking-[-0.02em]">Заявка {status.id} принята</h2>
        <p className="text-muted">Скоро свяжемся с вами для подтверждения конфигурации.</p>
        <Button variant="ghost" onClick={() => setStatus({ kind: "idle" })}>
          Отправить ещё одну
        </Button>
      </div>
    );
  }

  return (
    <form className={CARD} onSubmit={handleSubmit} noValidate>
      <Field name="name" label="Имя" error={errors.name} autoComplete="name" />
      <Field name="contact" label="Телефон, e‑mail или Telegram" error={errors.contact} />
      <Field name="budget" label="Бюджет, ₸ (необязательно)" error={errors.budget} inputMode="numeric" />
      <label className="grid gap-2">
        <span className="text-[13px] text-muted">Комментарий</span>
        <textarea className={INPUT} name="comment" rows={3} maxLength={1000} placeholder="Игры, монтаж, тишина, подсветка…" />
        {errors.comment && <em className="text-[13px] not-italic text-danger">{errors.comment}</em>}
      </label>

      {parts.length > 0 && (
        <label className="flex cursor-pointer items-start gap-3 rounded-card bg-surface px-4 py-3.5 text-sm text-muted">
          <input className="mt-[3px] accent-accent" type="checkbox" name="attach" defaultChecked />
          <span>
            Приложить конфигурацию «{presetTitle ?? "Своя"}» — {parts.length} позиций, {formatPrice(summary.total)}
          </span>
        </label>
      )}

      {status.kind === "failed" && <p className="text-sm text-danger">{status.message}</p>}
      <Button type="submit" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Отправляем…" : "Отправить заявку"}
      </Button>
    </form>
  );
}

function Field({ name, label, error, ...rest }: { name: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-2">
      <span className="text-[13px] text-muted">{label}</span>
      <input className={INPUT} name={name} aria-invalid={Boolean(error)} {...rest} />
      {error && <em className="text-[13px] not-italic text-danger">{error}</em>}
    </label>
  );
}
