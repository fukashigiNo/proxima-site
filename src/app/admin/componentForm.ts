import "server-only";
import type { NewComponent } from "@/application/use-cases/admin/ManageComponents";
import { CITIES, type ComponentCategory, type PcComponent } from "@/domain/entities/PcComponent";

/**
 * Адаптер: FormData → данные комплектующего. Здесь только разбор строк в типы;
 * все правила (диапазоны, обязательность) проверяет доменный validateComponent.
 */
const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const num = (form: FormData, key: string) => {
  const raw = str(form, key).replace(/\s/g, "").replace(",", ".");
  return raw === "" ? NaN : Number(raw);
};
const all = (form: FormData, key: string) => form.getAll(key).map(String);

/** «Ключ: значение» построчно → объект характеристик */
export const parseSpecs = (raw: string): Record<string, string> =>
  Object.fromEntries(
    raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const i = line.indexOf(":");
        return i === -1 ? [line, ""] : [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      }),
  );

export function componentFromForm(form: FormData): NewComponent {
  const category = str(form, "category") as ComponentCategory;
  const base = {
    brand: str(form, "brand"),
    name: str(form, "name"),
    price: num(form, "price"),
    powerDraw: num(form, "powerDraw"),
    specs: parseSpecs(str(form, "specs")),
    stock: Object.fromEntries(CITIES.map((c) => [c, num(form, `stock.${c}`)])),
  };

  switch (category) {
    case "cpu":
      return { ...base, category, socket: str(form, "socket") } as NewComponent;
    case "motherboard":
      return {
        ...base,
        category,
        socket: str(form, "socket"),
        memoryType: str(form, "memoryType"),
        formFactor: str(form, "formFactor"),
        pcieGen5M2: form.get("pcieGen5M2") === "on",
      } as NewComponent;
    case "gpu":
      return {
        ...base,
        category,
        lengthMm: num(form, "lengthMm"),
        slots: num(form, "slots"),
        fans: num(form, "fans"),
        powerConnector: str(form, "powerConnector"),
      } as NewComponent;
    case "ram":
      return { ...base, category, memoryType: str(form, "memoryType"), sticks: num(form, "sticks") } as NewComponent;
    case "storage":
      return { ...base, category, pcieGen: num(form, "pcieGen") } as NewComponent;
    case "cooling":
      return str(form, "kind") === "aio"
        ? ({ ...base, category, kind: "aio", radiatorMm: num(form, "radiatorMm"), capacityW: num(form, "capacityW") } as NewComponent)
        : ({ ...base, category, kind: "air", heightMm: num(form, "heightMm"), capacityW: num(form, "capacityW") } as NewComponent);
    case "psu":
      return { ...base, category, wattage: num(form, "wattage"), native12V2x6: form.get("native12V2x6") === "on" } as NewComponent;
    case "case":
      return {
        ...base,
        category,
        formFactors: all(form, "formFactors"),
        maxGpuLengthMm: num(form, "maxGpuLengthMm"),
        maxCoolerHeightMm: num(form, "maxCoolerHeightMm"),
        radiatorsMm: all(form, "radiatorsMm").map(Number),
        color: str(form, "color"),
      } as NewComponent;
    default:
      return { ...base, category } as unknown as NewComponent;
  }
}

export const componentWithId = (form: FormData): PcComponent =>
  ({ ...componentFromForm(form), id: str(form, "id") }) as PcComponent;
