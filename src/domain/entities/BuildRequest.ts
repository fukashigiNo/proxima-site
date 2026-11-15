export interface BuildRequestInput {
  readonly name: string;
  readonly contact: string;
  readonly budget?: number;
  readonly comment?: string;
  readonly componentIds: readonly string[];
}

export const REQUEST_STATUSES = ["new", "in_progress", "done", "cancelled"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Выполнена",
  cancelled: "Отменена",
};

/** Допустимые переходы статусов: закрытую заявку можно только вернуть в работу. */
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
}

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

/** Доменная валидация заявки — работает одинаково на клиенте и на сервере. */
export const validateBuildRequest = (input: Partial<BuildRequestInput>): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!input.name || input.name.trim().length < 2) errors.name = "Укажите имя";
  if (!input.contact || !CONTACT_PATTERN.test(input.contact.trim()))
    errors.contact = "Телефон, e‑mail или Telegram";
  if (input.budget !== undefined && (Number.isNaN(input.budget) || input.budget < 0))
    errors.budget = "Некорректный бюджет";
  if (input.comment && input.comment.length > 1000) errors.comment = "Не более 1000 символов";
  return errors;
};
