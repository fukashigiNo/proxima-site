import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getBot, isBotConfigured } from "@/bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const sameSecret = (given: string | null, expected: string) => {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!isBotConfigured() || !secret) return NextResponse.json({ ok: false }, { status: 503 });
  if (!sameSecret(request.headers.get("x-telegram-bot-api-secret-token"), secret)) return NextResponse.json({ ok: false }, { status: 401 });

  let update: unknown;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await getBot().handleUpdate(update as Parameters<ReturnType<typeof getBot>["handleUpdate"]>[0]);
    revalidatePath("/admin", "layout");
  } catch (error) {
    console.error("[telegram webhook]", error);
  }
  return NextResponse.json({ ok: true });
}
