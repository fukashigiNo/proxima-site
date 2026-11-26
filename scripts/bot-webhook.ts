import { BOT_COMMANDS } from "@/bot/createBot";

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const action = process.argv[2] ?? "set";
const urlArg = process.argv.find((a) => a.startsWith("--url="))?.slice(6);
const site = (urlArg || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

if (!token) {
  console.error("Нет TELEGRAM_BOT_TOKEN в .env.local");
  process.exit(1);
}

const api = async (method: string, body?: unknown) => {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const json = (await response.json()) as { ok: boolean; result?: unknown; description?: string };
  if (!json.ok) throw new Error(`${method}: ${json.description}`);
  return json.result;
};

if (action === "info") {
  const info = (await api("getWebhookInfo")) as Record<string, unknown>;
  console.log({ url: info.url, pending: info.pending_update_count, lastError: info.last_error_message ?? null });
} else if (action === "delete") {
  await api("deleteWebhook");
  console.log("Вебхук отключён.");
} else {
  if (!secret || secret.length < 16 || !/^[A-Za-z0-9_-]+$/.test(secret)) {
    console.error("TELEGRAM_WEBHOOK_SECRET: от 16 символов, только латиница, цифры, _ и -. Сгенерировать: openssl rand -hex 24");
    process.exit(1);
  }
  if (!site.startsWith("https://")) {
    console.error("Нужен публичный https-адрес сайта: задайте NEXT_PUBLIC_SITE_URL или передайте --url=https://ваш-сайт");
    process.exit(1);
  }
  const url = `${site}/api/telegram`;
  await api("setWebhook", { url, secret_token: secret, allowed_updates: ["message", "callback_query"], drop_pending_updates: true });
  await api("setMyCommands", { commands: BOT_COMMANDS });
  await api("setMyDescription", { description: "Соберите ПК из того, что есть в наличии, выберите готовую сборку или оставьте заявку — Proxima Computers." });
  await api("setMyShortDescription", { short_description: "Сборка ПК на заказ в Казахстане" });
  const me = (await api("getMe")) as { username: string };
  console.log(`Вебхук для @${me.username} подключён: ${url}`);
}
