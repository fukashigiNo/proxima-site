/** Склеивает классы, пропуская пустые значения. */
export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
