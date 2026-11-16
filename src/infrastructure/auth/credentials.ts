import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

export function checkAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export const isAdminConfigured = () =>
  Boolean(process.env.ADMIN_PASSWORD && (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32);

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const failures = new Map<string, number[]>();

export function isRateLimited(key: string, now = Date.now()) {
  const recent = (failures.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  failures.set(key, recent);
  return recent.length >= MAX_ATTEMPTS;
}

export function registerFailure(key: string, now = Date.now()) {
  failures.set(key, [...(failures.get(key) ?? []), now]);
}

export function clearFailures(key: string) {
  failures.delete(key);
}
