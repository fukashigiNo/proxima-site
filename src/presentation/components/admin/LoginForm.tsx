"use client";

import { useActionState } from "react";
import { login, type ActionState } from "@/app/admin/actions";
import { Button } from "../ui/Button";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, {});
  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="next" value={next ?? "/admin"} />
      <label className="grid gap-2">
        <span className="text-[13px] text-muted">Пароль администратора</span>
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="h-12 rounded-card border border-line-strong bg-bg px-4 text-base text-ink outline-none transition-colors focus:border-ink"
        />
      </label>
      {state.message && (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Входим…" : "Войти"}
      </Button>
    </form>
  );
}
