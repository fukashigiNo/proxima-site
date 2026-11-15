import type { PcComponent } from "@/domain/entities/PcComponent";
import type { ComponentRepository } from "@/domain/repositories/ComponentRepository";

/** Каталог в памяти — для тестов и демо. */
export class InMemoryComponentRepository implements ComponentRepository {
  private components: PcComponent[];

  constructor(components: readonly PcComponent[]) {
    this.components = [...components];
  }

  async findAll() {
    return [...this.components];
  }

  async findByIds(ids: readonly string[]) {
    const wanted = new Set(ids);
    return this.components.filter((c) => wanted.has(c.id));
  }

  async create(component: PcComponent) {
    this.components = [...this.components, component];
  }

  async update(component: PcComponent) {
    this.components = this.components.map((c) => (c.id === component.id ? component : c));
  }

  async delete(id: string) {
    this.components = this.components.filter((c) => c.id !== id);
  }
}
