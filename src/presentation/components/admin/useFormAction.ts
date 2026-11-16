"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import type { ActionState } from "@/app/admin/actions";

type ServerAction = (state: ActionState, form: FormData) => Promise<ActionState>;

export function useFormAction(serverAction: ServerAction, confirmMessage?: string) {
  const [state, action, pending] = useActionState<ActionState, FormData>(serverAction, {});
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  };
  return { state, onSubmit, pending };
}
