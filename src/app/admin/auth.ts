import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, sessionSecret, verifySessionToken } from "@/infrastructure/auth/session";

/** Проверка сессии внутри серверных действий и страниц — middleware не единственная защита. */
export async function requireAdmin() {
  const secret = sessionSecret();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!secret || !(await verifySessionToken(token, secret))) redirect("/admin/login");
}
