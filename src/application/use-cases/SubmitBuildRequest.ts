import {
  ValidationError,
  validateBuildRequest,
  type BuildRequest,
  type BuildRequestInput,
} from "@/domain/entities/BuildRequest";
import type { BuildRequestRepository } from "@/domain/repositories/BuildRequestRepository";
import type { ComponentRepository } from "@/domain/repositories/ComponentRepository";

export class SubmitBuildRequest {
  constructor(
    private readonly requests: BuildRequestRepository,
    private readonly components: ComponentRepository,
    private readonly generateId: () => string,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(input: Partial<BuildRequestInput>): Promise<BuildRequest> {
    const errors = validateBuildRequest(input);
    if (Object.keys(errors).length > 0) throw new ValidationError(errors);

    const known = await this.components.findByIds(input.componentIds ?? []);

    const request: BuildRequest = {
      id: this.generateId(),
      createdAt: this.now().toISOString(),
      status: "new",
      channel: "site",
      name: input.name!.trim(),
      contact: input.contact!.trim(),
      budget: input.budget,
      comment: input.comment?.trim() || undefined,
      componentIds: known.map((c) => c.id),
      buildTitle: known.length ? input.buildTitle?.trim() || undefined : undefined,
    };
    await this.requests.save(request);
    return request;
  }
}
