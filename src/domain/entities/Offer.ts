import { CITIES, type City, type PcComponent } from "./PcComponent";

export interface OfferPatch {
  readonly price: number;
  readonly stock: Readonly<Record<City, number>>;
}

export const MAX_PRICE = 50_000_000;
export const MAX_STOCK = 9_999;

export const validateOfferPatch = (patch: OfferPatch): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!Number.isInteger(patch.price) || patch.price <= 0 || patch.price > MAX_PRICE)
    errors.price = "Цена — целое число больше 0";
  for (const city of CITIES) {
    const n = patch.stock[city];
    if (!Number.isInteger(n) || n < 0 || n > MAX_STOCK) errors[`stock.${city}`] = "Остаток — целое число ≥ 0";
  }
  return errors;
};

export const applyOfferPatch = <T extends PcComponent>(component: T, patch: OfferPatch): T => ({
  ...component,
  price: patch.price,
  stock: { ...patch.stock },
});
