"use client";

import { useActionState } from "react";
import { changeRequestStatus, type ActionState } from "@/app/admin/actions";
import { REQUEST_STATUS_LABELS, nextStatuses, type RequestStatus } from "@/domain/entities/BuildRequest";
import { cn } from "@/presentation/lib/cn";

/** Кнопки допустимых переходов статуса — недопустимые не показываются вовсе. */
export function StatusControl({ id, status }: { id: string; status: RequestStatus }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(changeRequestStatus, {});
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Отдельная форма на каждый переход: значение передаётся скрытым полем, а не через submitter */}
      {nextStatuses(status).map((to) => (
        <form key={to} action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value={to} />
          <button
            type="submit"
            disabled={pending}
            className={cn(
              "h-9 rounded-full border px-3.5 text-[13px] transition-colors disabled:opacity-50",
              to === "done" || to === "in_progress"
                ? "border-ink bg-ink text-bg hover:border-accent hover:bg-accent"
                : "border-line-strong text-ink hover:border-ink",
            )}
          >
            {to === "new" ? "Вернуть в новые" : REQUEST_STATUS_LABELS[to]}
          </button>
        </form>
      ))}
      {state.message && <span className="text-xs text-danger">{state.message}</span>}
    </div>
  );
}
