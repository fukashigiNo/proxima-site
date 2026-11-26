import { BOT_COMMANDS } from "@/bot/createBot";
import { getBot } from "@/bot";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("Нет TELEGRAM_BOT_TOKEN в .env.local");
  process.exit(1);
}

const bot = getBot();
const me = await bot.telegram.getMe();
const hook = await bot.telegram.getWebhookInfo();
if (hook.url && !process.argv.includes("--force")) {
  console.error(
    `У бота @${me.username} подключён вебхук ${hook.url} — значит, он уже работает на сайте.\n` +
      "Локальный запуск отключит вебхук, и бот на сайте перестанет отвечать, пока вы снова не выполните npm run bot:webhook.\n" +
      "Для разработки лучше завести отдельного тестового бота. Если всё равно хотите — запустите с флагом: npm run bot:dev -- --force",
  );
  process.exit(1);
}

await bot.telegram.setMyCommands(BOT_COMMANDS);
console.log(`Бот @${me.username} запущен локально (polling). Ctrl+C — остановить.`);
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
await bot.launch({ dropPendingUpdates: true });
