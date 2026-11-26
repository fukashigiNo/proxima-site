import { Markup, Telegraf, session, type Context } from "telegraf";
import type { InlineKeyboardButton } from "telegraf/types";
import { evaluateBuild, evaluateCandidate } from "@/application/use-cases/EvaluateBuild";
import type { Catalog } from "@/application/use-cases/GetCatalog";
import { removeCategory, selectComponent, type BuildSelection } from "@/domain/entities/Build";
import { ValidationError, telegramProfileLink, type TelegramRequestInput } from "@/domain/entities/BuildRequest";
import { CATEGORY_LABELS, COMPONENT_CATEGORIES, type ComponentCategory, type PcComponent } from "@/domain/entities/PcComponent";
import { BUSINESS, daysWord, yearsWord } from "@/presentation/content/business";
import { technicalDetails } from "@/presentation/lib/componentDetails";
import { esc, isAvailable, money, partName, selectionLines, stockLine, summaryLines, truncate } from "./format";
import type { BotDeps, BotSession, OrderTarget } from "./types";

type Ctx = Context & { session: BotSession };
type Row = InlineKeyboardButton[];

const PAGE_SIZE = 6;
const CATEGORY_RE = COMPONENT_CATEGORIES.join("|");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const btn = (text: string, data: string) => Markup.button.callback(text, data);
const back = (data: string, text = "⬅️ Назад") => [btn(text, data)];
const menuRow = () => [btn("🏠 Меню", "menu")];

export function createBot(token: string, deps: BotDeps) {
  const bot = new Telegraf<Ctx>(token);

  bot.use(
    session<BotSession, Ctx>({
      store: {
        get: async (key) => (await deps.sessions.get(key)) as BotSession | undefined,
        set: (key, value) => deps.sessions.set(key, value),
        delete: (key) => deps.sessions.delete(key),
      },
      getSessionKey: (ctx) => (ctx.from && ctx.chat?.type === "private" ? `tg:${ctx.from.id}` : undefined),
      defaultSession: () => ({ build: {} }),
    }),
  );

  bot.use(async (ctx, next) => {
    if (ctx.chat && ctx.chat.type !== "private") return;
    ctx.session ??= { build: {} };
    ctx.session.build ??= {};
    return next();
  });

  const catalogItems = async () => {
    const catalog = await deps.getCatalog();
    return { catalog, all: COMPONENT_CATEGORIES.flatMap((c): PcComponent[] => catalog[c]) };
  };

  const resolveSelection = (catalog: Catalog, ids: BotSession["build"]): BuildSelection => {
    let selection: BuildSelection = {};
    for (const category of COMPONENT_CATEGORIES) {
      const part = (catalog[category] as PcComponent[]).find((c) => c.id === ids[category]);
      if (part) selection = selectComponent(selection, part);
    }
    return selection;
  };

  async function show(ctx: Ctx, text: string, rows: Row[], photo?: string) {
    const extra = { parse_mode: "HTML" as const, ...Markup.inlineKeyboard(rows) };
    const message = ctx.callbackQuery?.message;
    const isPhotoMessage = Boolean(message && "photo" in message);
    if (photo) {
      if (message) await ctx.deleteMessage().catch(() => undefined);
      try {
        await ctx.replyWithPhoto(photo, { caption: truncate(text, 1000), ...extra });
        return;
      } catch {
        await ctx.reply(text, { ...extra, link_preview_options: { is_disabled: true } });
        return;
      }
    }
    if (message && !isPhotoMessage) {
      try {
        await ctx.editMessageText(text, { ...extra, link_preview_options: { is_disabled: true } });
        return;
      } catch (error) {
        if (String(error).includes("message is not modified")) return;
      }
    }
    if (message && isPhotoMessage) await ctx.deleteMessage().catch(() => undefined);
    await ctx.reply(text, { ...extra, link_preview_options: { is_disabled: true } });
  }

  const answer = (ctx: Ctx, text?: string) => ctx.answerCbQuery(text).catch(() => undefined);

  async function showMenu(ctx: Ctx) {
    const name = ctx.from?.first_name ? `, ${esc(ctx.from.first_name)}` : "";
    await show(
      ctx,
      [
        `Привет${name}! Это бот <b>Proxima Computers</b> — собираем компьютеры на заказ в Казахстане.`,
        "",
        "Здесь можно собрать ПК из того, что есть у нас в наличии, выбрать готовую сборку, посмотреть каталог и оставить заявку.",
      ].join("\n"),
      [
        [btn("🧩 Собрать ПК", "b"), btn("📦 Готовые сборки", "ps")],
        [btn("🛒 Каталог", "cat"), btn("📝 Оставить заявку", "o:c")],
        [btn("ℹ️ Как мы работаем", "info"), Markup.button.url("🌐 Сайт", deps.siteUrl)],
      ],
    );
  }

  async function showBuilder(ctx: Ctx, note?: string) {
    const { catalog } = await catalogItems();
    const selection = resolveSelection(catalog, ctx.session.build);
    const summary = evaluateBuild(selection);
    const lines = selectionLines(selection);
    const text = [
      `<b>🧩 Конструктор${ctx.session.buildTitle ? ` · ${esc(ctx.session.buildTitle)}` : ""}</b>`,
      "В списках только то, что сейчас есть на складах, и только совместимое с вашей сборкой.",
      "",
      ...(lines.length ? [...lines, "", ...summaryLines(summary)] : ["Пока ничего не выбрано. Начните с процессора 👇"]),
      ...(note ? ["", note] : []),
    ].join("\n");
    const rows: Row[] = COMPONENT_CATEGORIES.map((category) => {
      const part = selection[category];
      return [btn(part ? `✅ ${CATEGORY_LABELS[category]}: ${truncate(part.name, 28)}` : `▫️ ${CATEGORY_LABELS[category]}`, `bc:${category}:0`)];
    });
    if (lines.length) rows.push([btn("🗑 Сбросить", "br"), btn("📝 Оформить заявку", "o:b")]);
    rows.push(menuRow());
    await show(ctx, text, rows);
  }

  async function showCategoryPicker(ctx: Ctx, category: ComponentCategory, page: number) {
    const { catalog } = await catalogItems();
    const selection = resolveSelection(catalog, ctx.session.build);
    const rest = removeCategory(selection, category);
    const inStock = (catalog[category] as PcComponent[]).filter(isAvailable);
    const rated = inStock.map((c) => ({ c, ...evaluateCandidate(rest, c) }));
    const options = rated.filter((r) => r.status !== "error");
    const hidden = rated.length - options.length;
    const pages = Math.max(1, Math.ceil(options.length / PAGE_SIZE));
    const current = Math.min(Math.max(page, 0), pages - 1);
    const slice = options.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
    const chosen = selection[category];

    const text = [
      `<b>${CATEGORY_LABELS[category]}</b>`,
      chosen ? `Сейчас: ${esc(partName(chosen))} — ${money(chosen.price)}` : "Сейчас: не выбрано",
      "",
      options.length
        ? slice
            .map((r) => {
              const specs = Object.values(r.c.specs).slice(0, 3).join(" · ");
              const warn = r.status === "warning" ? `\n   ⚠️ ${esc(r.reasons[0] ?? "")}` : "";
              return `${r.c.id === chosen?.id ? "✅" : "•"} <b>${esc(partName(r.c))}</b> — ${money(r.c.price)}\n   ${esc(specs)}${warn}`;
            })
            .join("\n")
        : "Сейчас нет подходящих позиций в наличии. Попробуйте поменять другие детали или оставьте заявку — подберём под заказ.",
      ...(hidden ? ["", `Скрыто несовместимых с вашей сборкой: ${hidden}`] : []),
    ].join("\n");

    const rows: Row[] = slice.map((r) => [btn(`${r.c.id === chosen?.id ? "✅ " : ""}${truncate(partName(r.c), 34)} · ${money(r.c.price)}`, `bp:${r.c.id}`)]);
    if (pages > 1)
      rows.push([
        btn(current > 0 ? "◀️" : " ", current > 0 ? `bc:${category}:${current - 1}` : "noop"),
        btn(`${current + 1} / ${pages}`, "noop"),
        btn(current < pages - 1 ? "▶️" : " ", current < pages - 1 ? `bc:${category}:${current + 1}` : "noop"),
      ]);
    if (chosen) rows.push([btn("✖️ Убрать из сборки", `bx:${category}`)]);
    rows.push(back("b", "⬅️ К сборке"));
    await show(ctx, text, rows);
  }

  async function showPresets(ctx: Ctx) {
    const presets = await deps.getPresets();
    await show(
      ctx,
      ["<b>📦 Готовые сборки</b>", "Мы сами подобрали эти конфигурации. Можно заказать как есть или поменять детали в конструкторе.", "", ...presets.map((p) => `• <b>${esc(p.title)}</b> — ${esc(p.tagline)}, ${money(p.summary.total)}`)].join("\n"),
      [...presets.map((p) => [btn(`${p.title} · ${money(p.summary.total)}`, `p:${p.id}`)]), menuRow()],
    );
  }

  async function showPreset(ctx: Ctx, id: string) {
    const preset = (await deps.getPresets()).find((p) => p.id === id);
    if (!preset) return showPresets(ctx);
    const parts = COMPONENT_CATEGORIES.flatMap((c): PcComponent[] => (preset.selection[c] ? [preset.selection[c] as PcComponent] : []));
    const missing = parts.filter((p) => !isAvailable(p));
    await show(
      ctx,
      [
        `<b>${esc(preset.title)}</b> · ${esc(preset.tagline)}`,
        esc(preset.purpose),
        "",
        ...selectionLines(preset.selection),
        "",
        ...summaryLines(preset.summary),
        ...(missing.length ? ["", `⏳ Сейчас нет в наличии: ${missing.map((m) => esc(m.name)).join(", ")} — привезём под заказ или предложим замену.`] : []),
      ].join("\n"),
      [
        [btn("📝 Оформить эту сборку", `o:p:${preset.id}`)],
        [btn("🧩 Изменить в конструкторе", `pl:${preset.id}`)],
        [Markup.button.url("🌐 На сайте", `${deps.siteUrl}/builder?preset=${preset.id}`)],
        back("ps", "⬅️ Все сборки"),
      ],
    );
  }

  async function showCatalog(ctx: Ctx) {
    const { catalog } = await catalogItems();
    const rows: Row[] = [];
    const buttons = COMPONENT_CATEGORIES.map((c) => btn(`${CATEGORY_LABELS[c]} (${(catalog[c] as PcComponent[]).filter(isAvailable).length})`, `cc:${c}:0`));
    for (let i = 0; i < buttons.length; i += 2) rows.push(buttons.slice(i, i + 2));
    rows.push(menuRow());
    await show(ctx, "<b>🛒 Каталог</b>\nВсё, что сейчас есть на складах в Алматы, Астане и Шымкенте. Выберите категорию:", rows);
  }

  async function showCatalogCategory(ctx: Ctx, category: ComponentCategory, page: number) {
    const { catalog } = await catalogItems();
    const items = (catalog[category] as PcComponent[]).filter(isAvailable);
    const size = 8;
    const pages = Math.max(1, Math.ceil(items.length / size));
    const current = Math.min(Math.max(page, 0), pages - 1);
    const slice = items.slice(current * size, current * size + size);
    const rows: Row[] = slice.map((c) => [btn(`${truncate(partName(c), 36)} · ${money(c.price)}`, `ci:${c.id}`)]);
    if (pages > 1)
      rows.push([
        btn(current > 0 ? "◀️" : " ", current > 0 ? `cc:${category}:${current - 1}` : "noop"),
        btn(`${current + 1} / ${pages}`, "noop"),
        btn(current < pages - 1 ? "▶️" : " ", current < pages - 1 ? `cc:${category}:${current + 1}` : "noop"),
      ]);
    rows.push(back("cat", "⬅️ Категории"));
    await show(ctx, `<b>${CATEGORY_LABELS[category]}</b> — в наличии ${items.length}\nНажмите на позицию, чтобы открыть карточку.`, rows);
  }

  async function showItem(ctx: Ctx, id: string) {
    const { all } = await catalogItems();
    const item = all.find((c) => c.id === id);
    if (!item) return showCatalog(ctx);
    const details = technicalDetails(item).slice(0, 8);
    const text = [
      `<b>${esc(partName(item))}</b>`,
      `${CATEGORY_LABELS[item.category]} · <b>${money(item.price)}</b>`,
      `📦 ${stockLine(item)}`,
      "",
      ...details.map(([k, v]) => `${esc(k)}: ${esc(v)}`),
      ...(item.imageCredit ? ["", `<i>${esc(item.imageCredit)}</i>`] : []),
    ].join("\n");
    const rows: Row[] = [
      ...(isAvailable(item) ? [[btn("🛍 Купить", `o:i:${item.id}`), btn("➕ В сборку", `bp:${item.id}`)]] : []),
      [Markup.button.url("🌐 На сайте", `${deps.siteUrl}/catalog/${item.id}`)],
      back(`cc:${item.category}:0`),
    ];
    await show(ctx, text, rows, item.image?.startsWith("https://") ? item.image : undefined);
  }

  async function showInfo(ctx: Ctx) {
    await show(
      ctx,
      [
        "<b>ℹ️ Как мы работаем</b>",
        "",
        "1. Вы выбираете сборку или присылаете задачу — подберём комплектующие сами.",
        "2. Менеджер связывается с вами, уточняет детали и фиксирует цену.",
        `3. Собираем за ${BUSINESS.buildDays} ${daysWord(BUSINESS.buildDays)}, укладываем кабели и тестируем под нагрузкой ${BUSINESS.testHours} часа.`,
        `4. Доставляем ${BUSINESS.delivery}.`,
        "",
        `Гарантия на сборку — ${BUSINESS.warrantyYears} ${yearsWord(BUSINESS.warrantyYears)}.`,
        `Оплата: ${BUSINESS.payment.join(", ")}.`,
      ].join("\n"),
      [[Markup.button.url("🌐 Подробнее на сайте", `${deps.siteUrl}/process`)], menuRow()],
    );
  }

  async function startOrder(ctx: Ctx, target: OrderTarget) {
    if (target.kind === "build" && !Object.keys(ctx.session.build).length) return showBuilder(ctx, "Сначала выберите хотя бы одну деталь.");
    ctx.session.flow = { step: "name", target };
    const first = [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(" ").trim();
    const rows: Row[] = [];
    if (first.length >= 2) rows.push([btn(`Да, я ${truncate(first, 30)}`, "fn")]);
    rows.push([btn("✖️ Отмена", "oc")]);
    await show(ctx, `<b>📝 Заявка</b>\n${await targetLine(target)}\n\nКак к вам обращаться? Напишите имя${first.length >= 2 ? " или нажмите кнопку" : ""}.`, rows);
  }

  async function targetLine(target: OrderTarget) {
    if (target.kind === "consult") return "Консультация: подберём конфигурацию под вашу задачу.";
    if (target.kind === "preset") {
      const preset = (await deps.getPresets()).find((p) => p.id === target.id);
      return preset ? `Сборка «${esc(preset.title)}» — ${money(preset.summary.total)}` : "Готовая сборка";
    }
    const { catalog, all } = await catalogItems();
    if (target.kind === "item") {
      const item = all.find((c) => c.id === target.id);
      return item ? `Покупка: ${esc(partName(item))} — ${money(item.price)}` : "Покупка комплектующего";
    }
    return "";
  }

  async function askContact(ctx: Ctx) {
    const flow = ctx.session.flow!;
    const username = ctx.from?.username;
    if (username) {
      flow.contact = telegramProfileLink(username);
      flow.step = "comment";
      return askComment(ctx, `Свяжемся с вами в Telegram: @${esc(username)}`);
    }
    flow.step = "contact";
    await ctx.reply(
      "У вашего аккаунта нет имени пользователя (@username), поэтому написать вам по ссылке мы не сможем.\n\nОтправьте номер телефона кнопкой ниже или напишите e‑mail.",
      Markup.keyboard([[Markup.button.contactRequest("📱 Отправить номер")], ["✖️ Отмена"]]).resize().oneTime(),
    );
  }

  async function askComment(ctx: Ctx, prefix?: string) {
    const flow = ctx.session.flow!;
    flow.step = "comment";
    await ctx.reply(
      `${prefix ? `${prefix}\n\n` : ""}Добавите комментарий? Например: бюджет, игры или программы, сроки. Или нажмите «Пропустить».`,
      { parse_mode: "HTML", ...Markup.inlineKeyboard([[btn("Пропустить", "fs")], [btn("✖️ Отмена", "oc")]]) },
    );
  }

  async function askConfirm(ctx: Ctx) {
    const flow = ctx.session.flow!;
    flow.step = "confirm";
    const lines = [
      "<b>Проверьте заявку</b>",
      await targetLine(flow.target),
      ...(flow.target.kind === "build" ? await buildBlock(ctx) : []),
      "",
      `Имя: ${esc(flow.name ?? "")}`,
      `Контакт: ${esc(flow.contact ?? "")}`,
      ...(flow.comment ? [`Комментарий: ${esc(flow.comment)}`] : []),
    ];
    await ctx.reply(lines.join("\n"), {
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
      ...Markup.inlineKeyboard([[btn("✅ Отправить", "osend")], [btn("✏️ Изменить", "oedit"), btn("✖️ Отмена", "oc")]]),
    });
  }

  async function buildBlock(ctx: Ctx) {
    const { catalog } = await catalogItems();
    const selection = resolveSelection(catalog, ctx.session.build);
    return ["", ...selectionLines(selection), "", ...summaryLines(evaluateBuild(selection))];
  }

  async function submitOrder(ctx: Ctx) {
    const flow = ctx.session.flow;
    if (!flow || flow.step !== "confirm" || !ctx.from) return showMenu(ctx);
    ctx.session.flow = undefined;

    let componentIds: string[] = [];
    let buildTitle: string | undefined;
    if (flow.target.kind === "build") {
      const { catalog } = await catalogItems();
      componentIds = Object.values(resolveSelection(catalog, ctx.session.build)).map((c) => c!.id);
      buildTitle = ctx.session.buildTitle ?? "Своя сборка (бот)";
    } else if (flow.target.kind === "preset") {
      const target = flow.target;
      const preset = (await deps.getPresets()).find((p) => p.id === target.id);
      componentIds = preset ? [...preset.componentIds] : [];
      buildTitle = preset?.title;
    } else if (flow.target.kind === "item") {
      const target = flow.target;
      const { all } = await catalogItems();
      const item = all.find((c) => c.id === target.id);
      componentIds = item ? [item.id] : [];
      buildTitle = item ? partName(item) : undefined;
    }

    const input: TelegramRequestInput = {
      name: flow.name ?? "",
      contact: flow.contact ?? "",
      comment: flow.comment,
      componentIds,
      buildTitle,
      telegram: {
        id: ctx.from.id,
        ...(ctx.from.username ? { username: ctx.from.username } : {}),
        name: [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" ").slice(0, 130) || undefined,
      },
    };

    try {
      const request = await deps.submitRequest(input);
      await ctx.reply(
        `✅ <b>Заявка ${request.id} принята!</b>\nМенеджер свяжется с вами ${BUSINESS.replyTime} в рабочее время.`,
        { parse_mode: "HTML", ...Markup.removeKeyboard() },
      );
      await show(ctx, "Что дальше?", [[btn("🏠 Меню", "menu")]]);
      await notifyManager(ctx, request.id, input);
    } catch (error) {
      if (error instanceof ValidationError) {
        ctx.session.flow = { ...flow, step: "name" };
        await ctx.reply(`Не получилось отправить: ${Object.values(error.fields).join(", ")}. Давайте попробуем ещё раз — как к вам обращаться?`);
        return;
      }
      throw error;
    }
  }

  async function notifyManager(ctx: Ctx, id: string, input: TelegramRequestInput) {
    if (!deps.managerChatId) return;
    const text = [
      `🆕 <b>Заявка ${id}</b> из Telegram-бота`,
      `${esc(input.name)} · ${esc(input.contact)}`,
      ...(input.buildTitle ? [`Что: ${esc(input.buildTitle)}${input.componentIds.length ? ` (${input.componentIds.length} поз.)` : ""}`] : ["Консультация"]),
      ...(input.comment ? [`Комментарий: ${esc(input.comment)}`] : []),
      `${deps.siteUrl}/admin/requests#${id}`,
    ].join("\n");
    await ctx.telegram.sendMessage(deps.managerChatId, text, { parse_mode: "HTML", link_preview_options: { is_disabled: true } }).catch((e) => console.error("[bot] notify manager:", e));
  }

  bot.start(async (ctx) => {
    ctx.session.flow = undefined;
    const payload = ctx.payload?.trim() ?? "";
    if (payload.startsWith("i_")) return showItem(ctx, payload.slice(2));
    if (payload.startsWith("p_")) return showPreset(ctx, payload.slice(2));
    if (payload === "build") return showBuilder(ctx);
    if (payload === "order") return startOrder(ctx, { kind: "consult" });
    return showMenu(ctx);
  });
  bot.command("menu", (ctx) => showMenu(ctx));
  bot.command("build", (ctx) => showBuilder(ctx));
  bot.command("builds", (ctx) => showPresets(ctx));
  bot.command("catalog", (ctx) => showCatalog(ctx));
  bot.command("order", (ctx) => startOrder(ctx, { kind: "consult" }));
  bot.command("help", (ctx) => showInfo(ctx));
  bot.command("cancel", async (ctx) => {
    ctx.session.flow = undefined;
    await ctx.reply("Отменено.", Markup.removeKeyboard());
    await showMenu(ctx);
  });

  bot.action("noop", (ctx) => answer(ctx));
  bot.action("menu", async (ctx) => {
    await answer(ctx);
    await showMenu(ctx);
  });
  bot.action("b", async (ctx) => {
    await answer(ctx);
    await showBuilder(ctx);
  });
  bot.action(new RegExp(`^bc:(${CATEGORY_RE}):(\\d{1,3})$`), async (ctx) => {
    await answer(ctx);
    await showCategoryPicker(ctx, ctx.match[1] as ComponentCategory, Number(ctx.match[2]));
  });
  bot.action(/^bp:([\w.-]{1,60})$/, async (ctx) => {
    const { all } = await catalogItems();
    const part = all.find((c) => c.id === ctx.match[1]);
    if (!part || !isAvailable(part)) return answer(ctx, "Этой позиции уже нет в наличии");
    ctx.session.build = { ...ctx.session.build, [part.category]: part.id };
    ctx.session.buildTitle = null;
    await answer(ctx, `Добавлено: ${truncate(part.name, 40)}`);
    const { catalog } = await catalogItems();
    const next = COMPONENT_CATEGORIES.find((c) => !ctx.session.build[c]);
    const evaluation = evaluateBuild(resolveSelection(catalog, ctx.session.build));
    if (next && !evaluation.conflictCategories.length) return showCategoryPicker(ctx, next, 0);
    await showBuilder(ctx);
  });
  bot.action(new RegExp(`^bx:(${CATEGORY_RE})$`), async (ctx) => {
    const { [ctx.match[1] as ComponentCategory]: _, ...rest } = ctx.session.build;
    ctx.session.build = rest;
    ctx.session.buildTitle = null;
    await answer(ctx, "Убрано");
    await showBuilder(ctx);
  });
  bot.action("br", async (ctx) => {
    ctx.session.build = {};
    ctx.session.buildTitle = null;
    await answer(ctx, "Сборка очищена");
    await showBuilder(ctx);
  });

  bot.action("ps", async (ctx) => {
    await answer(ctx);
    await showPresets(ctx);
  });
  bot.action(/^p:([\w-]{1,40})$/, async (ctx) => {
    await answer(ctx);
    await showPreset(ctx, ctx.match[1]);
  });
  bot.action(/^pl:([\w-]{1,40})$/, async (ctx) => {
    const preset = (await deps.getPresets()).find((p) => p.id === ctx.match[1]);
    if (!preset) return answer(ctx, "Сборка не найдена");
    ctx.session.build = Object.fromEntries(COMPONENT_CATEGORIES.flatMap((c) => (preset.selection[c] ? [[c, preset.selection[c]!.id]] : [])));
    ctx.session.buildTitle = preset.title;
    await answer(ctx, "Сборка загружена в конструктор");
    await showBuilder(ctx, "Это детали готовой сборки. Если какой-то нет в наличии, замените её — в списках только то, что есть на складе.");
  });

  bot.action("cat", async (ctx) => {
    await answer(ctx);
    await showCatalog(ctx);
  });
  bot.action(new RegExp(`^cc:(${CATEGORY_RE}):(\\d{1,3})$`), async (ctx) => {
    await answer(ctx);
    await showCatalogCategory(ctx, ctx.match[1] as ComponentCategory, Number(ctx.match[2]));
  });
  bot.action(/^ci:([\w.-]{1,60})$/, async (ctx) => {
    await answer(ctx);
    await showItem(ctx, ctx.match[1]);
  });
  bot.action("info", async (ctx) => {
    await answer(ctx);
    await showInfo(ctx);
  });

  bot.action("o:b", async (ctx) => {
    await answer(ctx);
    await startOrder(ctx, { kind: "build" });
  });
  bot.action("o:c", async (ctx) => {
    await answer(ctx);
    await startOrder(ctx, { kind: "consult" });
  });
  bot.action(/^o:p:([\w-]{1,40})$/, async (ctx) => {
    await answer(ctx);
    await startOrder(ctx, { kind: "preset", id: ctx.match[1] });
  });
  bot.action(/^o:i:([\w.-]{1,60})$/, async (ctx) => {
    await answer(ctx);
    await startOrder(ctx, { kind: "item", id: ctx.match[1] });
  });
  bot.action("fn", async (ctx) => {
    await answer(ctx);
    const flow = ctx.session.flow;
    if (!flow || flow.step !== "name") return showMenu(ctx);
    flow.name = [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(" ").trim().slice(0, 100);
    await askContact(ctx);
  });
  bot.action("fs", async (ctx) => {
    await answer(ctx);
    const flow = ctx.session.flow;
    if (!flow || flow.step !== "comment") return showMenu(ctx);
    flow.comment = undefined;
    await askConfirm(ctx);
  });
  bot.action("oedit", async (ctx) => {
    await answer(ctx);
    const flow = ctx.session.flow;
    if (!flow) return showMenu(ctx);
    await startOrder(ctx, flow.target);
  });
  bot.action("osend", async (ctx) => {
    await answer(ctx, "Отправляем…");
    await ctx.editMessageReplyMarkup(undefined).catch(() => undefined);
    await submitOrder(ctx);
  });
  bot.action("oc", async (ctx) => {
    await answer(ctx, "Заявка отменена");
    ctx.session.flow = undefined;
    await ctx.reply("Заявка отменена.", Markup.removeKeyboard());
    await showMenu(ctx);
  });

  bot.on("contact", async (ctx) => {
    const flow = ctx.session.flow;
    if (!flow || flow.step !== "contact") return;
    const contact = ctx.message.contact;
    if (contact.user_id !== ctx.from.id) {
      await ctx.reply("Пожалуйста, отправьте свой номер кнопкой «📱 Отправить номер» или напишите e‑mail.");
      return;
    }
    const digits = contact.phone_number.replace(/\D/g, "");
    flow.contact = `+${digits}`;
    await ctx.reply("Номер получили 👍", Markup.removeKeyboard());
    await askComment(ctx);
  });

  bot.on("text", async (ctx) => {
    const text = ctx.message.text.trim();
    const flow = ctx.session.flow;
    if (!flow) {
      await showMenu(ctx);
      return;
    }
    if (text === "✖️ Отмена") {
      ctx.session.flow = undefined;
      await ctx.reply("Заявка отменена.", Markup.removeKeyboard());
      await showMenu(ctx);
      return;
    }
    switch (flow.step) {
      case "name":
        if (text.length < 2 || text.length > 100) {
          await ctx.reply("Имя должно быть от 2 до 100 символов. Как к вам обращаться?");
          return;
        }
        flow.name = text;
        await askContact(ctx);
        return;
      case "contact": {
        const digits = text.replace(/[^\d+]/g, "");
        if (EMAIL_RE.test(text) && text.length <= 100) flow.contact = text;
        else if (/^\+?\d{10,15}$/.test(digits)) flow.contact = digits.startsWith("+") ? digits : `+${digits}`;
        else {
          await ctx.reply("Не похоже на телефон или e‑mail. Отправьте номер кнопкой «📱 Отправить номер» или напишите почту, например name@mail.kz");
          return;
        }
        await ctx.reply("Контакт сохранили 👍", Markup.removeKeyboard());
        await askComment(ctx);
        return;
      }
      case "comment":
        flow.comment = text.slice(0, 1000);
        await askConfirm(ctx);
        return;
      case "confirm":
        await ctx.reply("Нажмите «✅ Отправить», чтобы отправить заявку, или «✏️ Изменить».");
        return;
    }
  });

  bot.catch(async (error, ctx) => {
    console.error("[bot]", error);
    await ctx.reply("Что-то пошло не так. Попробуйте ещё раз или откройте /menu.").catch(() => undefined);
  });

  return bot;
}

export const BOT_COMMANDS = [
  { command: "menu", description: "Главное меню" },
  { command: "build", description: "Собрать ПК" },
  { command: "builds", description: "Готовые сборки" },
  { command: "catalog", description: "Каталог комплектующих" },
  { command: "order", description: "Оставить заявку" },
  { command: "help", description: "Как мы работаем" },
  { command: "cancel", description: "Отменить заявку" },
];
