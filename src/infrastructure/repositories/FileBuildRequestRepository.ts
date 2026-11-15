import "server-only";
import type { BuildRequest } from "@/domain/entities/BuildRequest";
import type { BuildRequestRepository } from "@/domain/repositories/BuildRequestRepository";
import type { JsonFileStore } from "../persistence/JsonFileStore";

export class FileBuildRequestRepository implements BuildRequestRepository {
  constructor(private readonly store: JsonFileStore<BuildRequest[]>) {}

  findAll() {
    return this.store.read();
  }

  async findById(id: string) {
    return (await this.store.read()).find((r) => r.id === id) ?? null;
  }

  /** Создаёт или обновляет заявку */
  async save(request: BuildRequest) {
    await this.store.update((all) =>
      all.some((r) => r.id === request.id) ? all.map((r) => (r.id === request.id ? request : r)) : [...all, request],
    );
  }
}
