export interface BuildRequestInput {
  readonly name: string;
  readonly contact: string;
  readonly budget?: number;
  readonly comment?: string;
  readonly componentIds: readonly string[];
  readonly buildTitle?: string;
}

export const REQUEST_CHANNELS = ["site", "telegram", "whatsapp", "telegram_bot"] as const;
export type RequestChannel = (typeof REQUEST_CHANNELS)[number];
export type MessengerChannel = "telegram" | "whatsapp";

export const REQUEST_CHANNEL_LABELS: Record<RequestChannel, string> = {
  site: "Сайт",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  telegram_bot: "Telegram-бот",
};

export interface TelegramAccount {
  readonly id: number;
  readonly username?: string;
  readonly name?: string;
}

export const REQUEST_STATUSES = ["new", "in_progress", "done", "cancelled"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Выполнена",
  cancelled: "Отменена",
};

const TRANSITIONS: Record<RequestStatus, readonly RequestStatus[]> = {
  new: ["in_progress", "cancelled"],
  in_progress: ["done", "cancelled", "new"],
  done: ["in_progress"],
  cancelled: ["in_progress"],
};

export const canTransition = (from: RequestStatus, to: RequestStatus) => TRANSITIONS[from].includes(to);
export const nextStatuses = (from: RequestStatus) => TRANSITIONS[from];

export interface BuildRequest extends BuildRequestInput {
  readonly id: string;
  readonly createdAt: string;
  readonly status: RequestStatus;
  readonly updatedAt?: string;
  readonly channel?: RequestChannel;
  readonly telegram?: TelegramAccount;
}

export const channelOf = (request: BuildRequest): RequestChannel => request.channel ?? "site";

export interface MessengerRequestInput {
  readonly channel: MessengerChannel;
  readonly reference: string;
  readonly componentIds: readonly string[];
  readonly buildTitle?: string;
}

export const REFERENCE_PATTERN = /^PX-[A-Z0-9]{6,8}$/;

export const validateMessengerRequest = (input: Partial<MessengerRequestInput>): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (input.channel !== "telegram" && input.channel !== "whatsapp") errors.channel = "Неизвестный мессенджер";
  if (!input.reference || !REFERENCE_PATTERN.test(input.reference)) errors.reference = "Некорректный код заявки";
  if (!Array.isArray(input.componentIds) || input.componentIds.length > 16 || input.componentIds.some((id) => typeof id !== "string"))
    errors.componentIds = "Некорректная конфигурация";
  if (input.buildTitle !== undefined && (typeof input.buildTitle !== "string" || input.buildTitle.length > 80))
    errors.buildTitle = "Некорректное название";
  return errors;
};

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class ValidationError extends Error {
  constructor(public readonly fields: Record<string, string>) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}

const CONTACT_PATTERN = /^(\+?[\d\s()-]{10,18}|[^\s@]+@[^\s@]+\.[^\s@]+|@[\w]{4,32})$/;

export const validateBuildRequest = (input: Partial<BuildRequestInput>): Record<string, string> => {
  const errors: Record<string, string> = {};
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const contact = typeof input.contact === "string" ? input.contact.trim() : "";
  if (name.length < 2 || name.length > 100) errors.name = "Укажите имя";
  if (!contact || contact.length > 100 || !CONTACT_PATTERN.test(contact)) errors.contact = "Телефон, e‑mail или Telegram";
  if (input.budget !== undefined && (typeof input.budget !== "number" || !Number.isFinite(input.budget) || input.budget < 0 || input.budget > 1e9))
    errors.budget = "Некорректный бюджет";
  if (input.comment !== undefined && (typeof input.comment !== "string" || input.comment.length > 1000))
    errors.comment = "Не более 1000 символов";
  if (input.componentIds !== undefined && (!Array.isArray(input.componentIds) || input.componentIds.length > 16 || input.componentIds.some((id) => typeof id !== "string")))
    errors.componentIds = "Некорректная конфигурация";
  if (input.buildTitle !== undefined && (typeof input.buildTitle !== "string" || input.buildTitle.length > 80))
    errors.buildTitle = "Некорректное название сборки";
  return errors;
};

export const TELEGRAM_USERNAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]{3,31}$/;
export const telegramProfileLink = (username: string) => `https://t.me/${username}`;
const TELEGRAM_LINK_PATTERN = /^https:\/\/t\.me\/[A-Za-z][A-Za-z0-9_]{3,31}$/;

export const isContactValid = (contact: string) => {
  const value = contact.trim();
  return value.length <= 100 && (CONTACT_PATTERN.test(value) || TELEGRAM_LINK_PATTERN.test(value));
};

export interface TelegramRequestInput {
  readonly name: string;
  readonly contact: string;
  readonly comment?: string;
  readonly componentIds: readonly string[];
  readonly buildTitle?: string;
  readonly telegram: TelegramAccount;
}

export const validateTelegramRequest = (input: Partial<TelegramRequestInput>): Record<string, string> => {
  const errors = validateBuildRequest({ name: input.name, contact: "@placeholder", comment: input.comment, componentIds: input.componentIds, buildTitle: input.buildTitle });
  if (typeof input.contact !== "string" || !isContactValid(input.contact)) errors.contact = "Телефон, e‑mail или ссылка на Telegram";
  const tg = input.telegram;
  if (!tg || !Number.isSafeInteger(tg.id) || tg.id <= 0) errors.telegram = "Нет данных Telegram";
  else if (tg.username !== undefined && !TELEGRAM_USERNAME_PATTERN.test(tg.username)) errors.telegram = "Некорректный username";
  else if (tg.name !== undefined && (typeof tg.name !== "string" || tg.name.length > 130)) errors.telegram = "Некорректное имя";
  return errors;
};
