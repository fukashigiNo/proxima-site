import {
  ValidationError,
  validateTelegramRequest,
  type BuildRequest,
  type TelegramRequestInput,
} from "@/domain/entities/BuildRequest";
import type { BuildRequestRepository } from "@/domain/repositories/BuildRequestRepository";
import type { ComponentRepository } from "@/domain/repositories/ComponentRepository";

export class SubmitTelegramRequest {
  constructor(
    private readonly requests: BuildRequestRepository,
    private readonly components: ComponentRepository,
    private readonly generateId: () => string,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(input: Partial<TelegramRequestInput>): Promise<BuildRequest> {
    const errors = validateTelegramRequest(input);
    if (Object.keys(errors).length > 0) throw new ValidationError(errors);

    const known = await this.components.findByIds(input.componentIds ?? []);
    const tg = input.telegram!;
    const request: BuildRequest = {
      id: this.generateId(),
      createdAt: this.now().toISOString(),
      status: "new",
      channel: "telegram_bot",
      name: input.name!.trim(),
      contact: input.contact!.trim(),
      comment: input.comment?.trim() || undefined,
      componentIds: known.map((c) => c.id),
      buildTitle: known.length ? input.buildTitle?.trim() || undefined : undefined,
      telegram: { id: tg.id, ...(tg.username ? { username: tg.username } : {}), ...(tg.name ? { name: tg.name.trim() } : {}) },
    };
    await this.requests.save(request);
    return request;
  }
}
