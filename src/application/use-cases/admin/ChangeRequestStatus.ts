import { DomainError, REQUEST_STATUS_LABELS, canTransition, type RequestStatus } from "@/domain/entities/BuildRequest";
import type { BuildRequestRepository } from "@/domain/repositories/BuildRequestRepository";

export class ChangeRequestStatus {
  constructor(
    private readonly requests: BuildRequestRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(id: string, to: RequestStatus) {
    const request = await this.requests.findById(id);
    if (!request) throw new DomainError("Заявка не найдена");
    if (!canTransition(request.status, to))
      throw new DomainError(`Нельзя перевести из «${REQUEST_STATUS_LABELS[request.status]}» в «${REQUEST_STATUS_LABELS[to]}»`);
    const updated = { ...request, status: to, updatedAt: this.now().toISOString() };
    await this.requests.save(updated);
    return updated;
  }
}
