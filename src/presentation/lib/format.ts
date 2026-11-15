const tenge = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

/** 245000 → «245 000 ₸» */
export const formatPrice = (value: number) => `${tenge.format(value)} ₸`;
export const formatWatts = (value: number) => `${value} Вт`;
