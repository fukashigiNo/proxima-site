import "server-only";
import type { PcComponent } from "@/domain/entities/PcComponent";
import type { ComponentRepository } from "@/domain/repositories/ComponentRepository";
import type { JsonFileStore } from "../persistence/JsonFileStore";

/** Каталог в JSON-файле; при первом запуске заполняется из демо-каталога. */
export class FileComponentRepository implements ComponentRepository {
  constructor(private readonly store: JsonFileStore<PcComponent[]>) {}

  findAll() {
    return this.store.read();
  }

  async findByIds(ids: readonly string[]) {
    const wanted = new Set(ids);
    return (await this.store.read()).filter((c) => wanted.has(c.id));
  }

  async create(component: PcComponent) {
    await this.store.update((all) => [...all, component]);
  }

  async update(component: PcComponent) {
    await this.store.update((all) => all.map((c) => (c.id === component.id ? component : c)));
  }

  async delete(id: string) {
    await this.store.update((all) => all.filter((c) => c.id !== id));
  }
}
