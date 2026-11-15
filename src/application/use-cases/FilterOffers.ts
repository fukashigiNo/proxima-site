import { stockIn, type City, type PcComponent } from "@/domain/entities/PcComponent";

export type SortOrder = "price-asc" | "price-desc";

export interface OfferFilter {
  readonly city: City | "all";
  readonly inStockOnly: boolean;
  readonly sort: SortOrder;
}

export const DEFAULT_FILTER: OfferFilter = { city: "all", inStockOnly: false, sort: "price-asc" };

/** Фильтрация предложений по наличию в городе и сортировка. */
export const filterOffers = <T extends PcComponent>(offers: readonly T[], filter: OfferFilter): T[] =>
  offers
    .filter((o) => !filter.inStockOnly || stockIn(o, filter.city) > 0)
    .sort((a, b) => (filter.sort === "price-asc" ? a.price - b.price : b.price - a.price));
