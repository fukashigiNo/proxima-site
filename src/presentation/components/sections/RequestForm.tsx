"use client";

import { useState, type FormEvent } from "react";
import { buildFormRequestMessage } from "@/presentation/lib/orderMessage";
import { validateBuildRequest, type BuildRequestInput } from "@/domain/entities/BuildRequest";
import { selectedComponents } from "@/domain/entities/Build";
import { submitBuildRequest, type SubmitResult } from "@/presentation/lib/api";
import { formatPrice } from "@/presentation/lib/format";
import { useBuild } from "@/presentation/state/BuildContext";
import { MessengerHandoff } from "../order/MessengerHandoff";
import { Button } from "../ui/Button";

const CARD = "grid gap-5 rounded-panel border border-line bg-surface/70 p-6 md:p-9";
const INPUT =
  "w-full resize-y border-0 border-b border-line-strong bg-transparent py-2 text-base text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-accent focus:shadow-[0_1px_0_0_var(--accent)] aria-invalid:border-danger";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done"; id: string; input: BuildRequestInput; withBuild: boolean }
  | { kind: "failed"; message: string };

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
      buildTitle: data.get("attach") && presetTitle ? presetTitle : undefined,
    };

    const clientErrors = validateBuildRequest(input);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setStatus({ kind: "sending" });
    const result: SubmitResult = await submitBuildRequest(input);
    if (result.ok) setStatus({ kind: "done", id: result.id, input, withBuild: input.componentIds.length > 0 });
    else if (result.fields) {
      setErrors(result.fields);
      setStatus({ kind: "idle" });
    } else setStatus({ kind: "failed", message: result.message });
  };

  if (status.kind === "done") {
    return (
      <div className={`${CARD} animate-rise justify-items-start`} role="status">
        <span className="grid size-11 animate-pop place-items-center rounded-full bg-accent text-xl text-on-accent" aria-hidden>
          ✓
        </span>
        <h2 className="text-[26px] font-medium tracking-[-0.02em]">Заявка {status.id} принята</h2>
        <p className="text-muted">Мы получили заявку и скоро напишем, чтобы всё уточнить.</p>
        <MessengerHandoff
          message={buildFormRequestMessage(
            { id: status.id, name: status.input.name.trim(), contact: status.input.contact.trim(), budget: status.input.budget, comment: status.input.comment?.trim() },
            status.withBuild ? selection : {},
            presetTitle,
            typeof window === "undefined" ? "" : window.location.origin,
          )}
        />
        <Button variant="ghost" onClick={() => setStatus({ kind: "idle" })}>
          Отправить ещё одну
        </Button>
      </div>
    );
  }

  return (
    <form className={CARD} onSubmit={handleSubmit} noValidate>
      <Field name="name" label="Имя" error={errors.name} autoComplete="name" />
      <Field name="contact" label="Как с вами связаться: телефон, Telegram или почта" error={errors.contact} />
      <Field name="budget" label="Сколько готовы потратить, ₸ (если знаете)" error={errors.budget} inputMode="numeric" />
      <label className="grid gap-2">
        <span className="text-[13px] text-muted">Для чего компьютер</span>
        <textarea className={INPUT} name="comment" rows={3} maxLength={1000} placeholder="Например: Warzone на 1440p, иногда монтаж, чтобы было тихо" />
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
