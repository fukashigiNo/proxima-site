import "server-only";
import { SITE_URL } from "@/app/siteUrl";
import { container } from "@/infrastructure/container";
import { createBot } from "./createBot";

const globalForBot = globalThis as unknown as { proximaBot?: ReturnType<typeof createBot> };

export const isBotConfigured = () => Boolean(process.env.TELEGRAM_BOT_TOKEN);

export function getBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN не задан");
  globalForBot.proximaBot ??= createBot(token, {
    getCatalog: () => container.getCatalog.execute(),
    getPresets: () => container.getPresetBuilds.execute(),
    submitRequest: (input) => container.submitTelegramRequest.execute(input),
    sessions: container.botSessions,
    siteUrl: SITE_URL,
    managerChatId: process.env.TELEGRAM_MANAGER_CHAT_ID || undefined,
  });
  return globalForBot.proximaBot;
}
