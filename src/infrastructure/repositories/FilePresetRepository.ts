import "server-only";
import type { PresetBuild } from "@/domain/entities/Build";
import type { PresetRepository } from "@/domain/repositories/PresetRepository";
import type { JsonFileStore } from "../persistence/JsonFileStore";

export class FilePresetRepository implements PresetRepository {
  constructor(private readonly store: JsonFileStore<PresetBuild[]>) {}

  findAll() {
    return this.store.read();
  }

  async findById(id: string) {
    return (await this.store.read()).find((p) => p.id === id) ?? null;
  }

  async save(preset: PresetBuild) {
    await this.store.update((all) =>
      all.some((p) => p.id === preset.id) ? all.map((p) => (p.id === preset.id ? preset : p)) : [...all, preset],
    );
  }

  async delete(id: string) {
    await this.store.update((all) => all.filter((p) => p.id !== id));
  }
}
