import { COMPONENT_CATEGORIES, type ComponentCategory, type ComponentOf } from "@/domain/entities/PcComponent";
import type { ComponentRepository } from "@/domain/repositories/ComponentRepository";

export type Catalog = { [C in ComponentCategory]: ComponentOf<C>[] };

export class GetCatalog {
  constructor(private readonly components: ComponentRepository) {}

  async execute(): Promise<Catalog> {
    const all = await this.components.findAll();
    const catalog = Object.fromEntries(COMPONENT_CATEGORIES.map((c) => [c, [] as unknown[]])) as Record<
      ComponentCategory,
      unknown[]
    >;
    for (const component of [...all].sort((a, b) => a.price - b.price)) catalog[component.category].push(component);
    return catalog as Catalog;
  }
}
