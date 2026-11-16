"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { DomainError, REQUEST_STATUSES, ValidationError, type RequestStatus } from "@/domain/entities/BuildRequest";
import { CITIES, COMPONENT_CATEGORIES as CATEGORY_KEYS, type City } from "@/domain/entities/PcComponent";
import { checkAdminPassword, clearFailures, isAdminConfigured, isRateLimited, registerFailure } from "@/infrastructure/auth/credentials";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, createSessionToken, sessionSecret } from "@/infrastructure/auth/session";
import { container } from "@/infrastructure/container";
import { requireAdmin } from "./auth";
import { componentFromForm, componentWithId } from "./componentForm";

export interface ActionState {
  ok?: boolean;
  message?: string;
  fields?: Record<string, string>;
}

const safeNext = (value: FormDataEntryValue | null) => {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
};

export async function login(_: ActionState, form: FormData): Promise<ActionState> {
  if (!isAdminConfigured()) return { message: "Админка не настроена: задайте ADMIN_PASSWORD и ADMIN_SESSION_SECRET" };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isRateLimited(ip)) return { message: "Слишком много попыток. Попробуйте через 15 минут." };

  if (!checkAdminPassword(String(form.get("password") ?? ""))) {
    registerFailure(ip);
    return { message: "Неверный пароль" };
  }
  clearFailures(ip);

  (await cookies()).set(SESSION_COOKIE, await createSessionToken(sessionSecret()!), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function changeRequestStatus(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "") as RequestStatus;
  if (!REQUEST_STATUSES.includes(status)) return { message: "Неизвестный статус" };
  try {
    await container.admin.changeRequestStatus.execute(id, status);
  } catch (error) {
    if (error instanceof DomainError) return { message: error.message };
    throw error;
  }
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function updateOffer(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const toInt = (key: string) => {
    const raw = String(form.get(key) ?? "").replace(/\s/g, "");
    return raw === "" ? NaN : Number(raw);
  };
  const stock = Object.fromEntries(CITIES.map((c) => [c, toInt(`stock.${c}`)])) as Record<City, number>;
  try {
    await container.admin.updateOffer.execute(id, { price: toInt("price"), stock });
  } catch (error) {
    if (error instanceof ValidationError) return { message: "Проверьте значения", fields: error.fields };
    if (error instanceof DomainError) return { message: error.message };
    throw error;
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Сохранено" };
}

function revalidateCatalog() {
  revalidatePath("/", "layout");
}

async function run(task: () => Promise<unknown>): Promise<ActionState | null> {
  try {
    await task();
    return null;
  } catch (error) {
    if (error instanceof ValidationError) return { message: "Проверьте поля формы", fields: error.fields };
    if (error instanceof DomainError) return { message: error.message };
    throw error;
  }
}

export async function createComponent(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  let id = "";
  const failed = await run(async () => {
    id = (await container.admin.createComponent.execute(componentFromForm(form))).id;
  });
  if (failed) return failed;
  revalidateCatalog();
  redirect(`/admin/catalog/${id}?created=1`);
}

export async function saveComponent(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const failed = await run(() => container.admin.updateComponent.execute(componentWithId(form)));
  if (failed) return failed;
  revalidateCatalog();
  return { ok: true, message: "Сохранено" };
}

export async function deleteComponent(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const category = String(form.get("category") ?? "cpu");
  const failed = await run(() => container.admin.deleteComponent.execute(String(form.get("id") ?? "")));
  if (failed) return failed;
  revalidateCatalog();
  redirect(`/admin/catalog?category=${encodeURIComponent(category)}`);
}

export async function savePreset(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(form.get("id") ?? "") || undefined;
  const input = {
    id,
    title: String(form.get("title") ?? ""),
    tagline: String(form.get("tagline") ?? ""),
    purpose: String(form.get("purpose") ?? ""),
    componentIds: CATEGORY_KEYS.map((c) => String(form.get(`component.${c}`) ?? "")).filter(Boolean),
  };
  const failed = await run(() => container.admin.savePreset.execute(input));
  if (failed) return failed;
  revalidateCatalog();
  if (!id) redirect("/admin/presets");
  return { ok: true, message: "Сохранено" };
}

export async function deletePreset(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const failed = await run(() => container.admin.deletePreset.execute(String(form.get("id") ?? "")));
  if (failed) return failed;
  revalidateCatalog();
  redirect("/admin/presets");
}
