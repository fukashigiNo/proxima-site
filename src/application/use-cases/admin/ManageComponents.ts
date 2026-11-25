import { DomainError, ValidationError } from "@/domain/entities/BuildRequest";
import { makeComponentId, validateComponent } from "@/domain/entities/ComponentRules";
import type { PcComponent } from "@/domain/entities/PcComponent";
import type { ComponentRepository } from "@/domain/repositories/ComponentRepository";
import type { PresetRepository } from "@/domain/repositories/PresetRepository";

export type NewComponent = PcComponent extends infer C ? (C extends PcComponent ? Omit<C, "id"> : never) : never;

export class CreateComponent {
  constructor(private readonly components: ComponentRepository) {}

  async execute(input: NewComponent): Promise<PcComponent> {
    const taken = new Set((await this.components.findAll()).map((c) => c.id));
    const component = { ...input, id: makeComponentId(input.category, input.name ?? "", taken) } as PcComponent;
    const errors = validateComponent(component);
    if (Object.keys(errors).length > 0) throw new ValidationError(errors);
    await this.components.create(component);
    return component;
  }
}

export class UpdateComponent {
  constructor(private readonly components: ComponentRepository) {}

  async execute(component: PcComponent): Promise<PcComponent> {
    const [existing] = await this.components.findByIds([component.id]);
    if (!existing) throw new DomainError("Позиция не найдена");
    if (existing.category !== component.category) throw new DomainError("Категорию позиции изменить нельзя");
    const errors = validateComponent(component);
    if (Object.keys(errors).length > 0) throw new ValidationError(errors);
    await this.components.update(component);
    return component;
  }
}

export class SetAvailability {
  constructor(private readonly components: ComponentRepository) {}

  async execute(id: string, available: boolean): Promise<PcComponent> {
    const [existing] = await this.components.findByIds([id]);
    if (!existing) throw new DomainError("Позиция не найдена");
    const { outOfStock: _, ...rest } = existing;
    const component = (available ? rest : { ...rest, outOfStock: true }) as PcComponent;
    await this.components.update(component);
    return component;
  }
}

export class DeleteComponent {
  constructor(
    private readonly components: ComponentRepository,
    private readonly presets: PresetRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const [existing] = await this.components.findByIds([id]);
    if (!existing) throw new DomainError("Позиция не найдена");
    const usedIn = (await this.presets.findAll()).filter((p) => p.componentIds.includes(id));
    if (usedIn.length > 0)
      throw new DomainError(`Позиция входит в готовые сборки: ${usedIn.map((p) => p.title).join(", ")}. Сначала замените её там.`);
    await this.components.delete(id);
  }
}
