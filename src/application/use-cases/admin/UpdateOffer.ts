import { DomainError, ValidationError } from "@/domain/entities/BuildRequest";
import { applyOfferPatch, validateOfferPatch, type OfferPatch } from "@/domain/entities/Offer";
import type { ComponentRepository } from "@/domain/repositories/ComponentRepository";

/** Изменение цены и остатков позиции каталога. */
export class UpdateOffer {
  constructor(private readonly components: ComponentRepository) {}

  async execute(id: string, patch: OfferPatch) {
    const errors = validateOfferPatch(patch);
    if (Object.keys(errors).length > 0) throw new ValidationError(errors);
    const [component] = await this.components.findByIds([id]);
    if (!component) throw new DomainError("Позиция не найдена");
    const updated = applyOfferPatch(component, patch);
    await this.components.update(updated);
    return updated;
  }
}
