import { selectComponent, type BuildSelection } from "@/domain/entities/Build";
import type { ComponentRepository } from "@/domain/repositories/ComponentRepository";

/** Восстанавливает конфигурацию по списку id (например, из адреса страницы). Неизвестные id отбрасываются. */
export class ResolveBuild {
  static readonly MAX_PARTS = 16;

  constructor(private readonly components: ComponentRepository) {}

  async execute(ids: readonly string[]): Promise<BuildSelection> {
    const unique = [...new Set(ids)].slice(0, ResolveBuild.MAX_PARTS);
    if (unique.length === 0) return {};
    const parts = await this.components.findByIds(unique);
    return parts.reduce<BuildSelection>(selectComponent, {});
  }
}
