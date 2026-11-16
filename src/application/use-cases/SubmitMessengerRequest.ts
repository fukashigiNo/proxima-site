import {
  ValidationError,
  validateMessengerRequest,
  type BuildRequest,
  type MessengerRequestInput,
} from "@/domain/entities/BuildRequest";
import type { BuildRequestRepository } from "@/domain/repositories/BuildRequestRepository";
import type { ComponentRepository } from "@/domain/repositories/ComponentRepository";

export class SubmitMessengerRequest {
  constructor(
    private readonly requests: BuildRequestRepository,
    private readonly components: ComponentRepository,
    private readonly generateId: () => string,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(input: Partial<MessengerRequestInput>): Promise<BuildRequest> {
    const errors = validateMessengerRequest(input);
    if (Object.keys(errors).length > 0) throw new ValidationError(errors);

    const existing = await this.requests.findById(input.reference!);
    if (existing) {
      if (existing.channel && existing.channel !== "site") return existing;
      return this.create({ ...input, reference: this.generateId() } as MessengerRequestInput);
    }
    return this.create(input as MessengerRequestInput);
  }

  private async create(input: MessengerRequestInput): Promise<BuildRequest> {
    const known = await this.components.findByIds(input.componentIds);
    const request: BuildRequest = {
      id: input.reference,
      createdAt: this.now().toISOString(),
      status: "new",
      channel: input.channel,
      name: "",
      contact: "",
      buildTitle: input.buildTitle?.trim() || undefined,
      componentIds: known.map((c) => c.id),
    };
    await this.requests.save(request);
    return request;
  }
}
