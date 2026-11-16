import type { BuildRequest } from "@/domain/entities/BuildRequest";
import type { BuildRequestRepository } from "@/domain/repositories/BuildRequestRepository";

export class InMemoryBuildRequestRepository implements BuildRequestRepository {
  private items: BuildRequest[] = [];

  async findAll() {
    return [...this.items];
  }

  async findById(id: string) {
    return this.items.find((r) => r.id === id) ?? null;
  }

  async save(request: BuildRequest) {
    this.items = this.items.some((r) => r.id === request.id)
      ? this.items.map((r) => (r.id === request.id ? request : r))
      : [...this.items, request];
  }
}
