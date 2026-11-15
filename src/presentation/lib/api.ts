import type { BuildRequestInput } from "@/domain/entities/BuildRequest";

export type SubmitResult =
  | { ok: true; id: string }
  | { ok: false; message: string; fields?: Record<string, string> };

/** Адаптер HTTP для презентационного слоя. */
export async function submitBuildRequest(input: BuildRequestInput): Promise<SubmitResult> {
  try {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = await response.json();
    if (response.ok) return { ok: true, id: body.id };
    return { ok: false, message: body.message ?? "Не удалось отправить заявку", fields: body.fields };
  } catch {
    return { ok: false, message: "Нет соединения с сервером. Попробуйте ещё раз." };
  }
}
