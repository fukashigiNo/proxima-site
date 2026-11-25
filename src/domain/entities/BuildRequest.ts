export interface BuildRequestInput {
  readonly name: string;
  readonly contact: string;
  readonly budget?: number;
  readonly comment?: string;
  readonly componentIds: readonly string[];
  readonly buildTitle?: string;
}

export const REQUEST_CHANNELS = ["site", "telegram", "whatsapp"] as const;
export type RequestChannel = (typeof REQUEST_CHANNELS)[number];
export type MessengerChannel = Exclude<RequestChannel, "site">;

export const REQUEST_CHANNEL_LABELS: Record<RequestChannel, string> = {
  site: "Сайт",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
};

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
