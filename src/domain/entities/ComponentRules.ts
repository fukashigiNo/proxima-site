import { validateOfferPatch } from "./Offer";
import {
  CITIES,
  COMPONENT_CATEGORIES,
  IMAGE_URL_PATTERN,
  type City,
  type FormFactor,
  type MemoryType,
  type PcComponent,
  type Socket,
} from "./PcComponent";

export const SOCKETS: readonly Socket[] = ["AM5", "LGA1700", "LGA1851"];
export const MEMORY_TYPES: readonly MemoryType[] = ["DDR4", "DDR5"];
export const FORM_FACTORS: readonly FormFactor[] = ["ATX", "mATX", "ITX"];
export const RADIATOR_SIZES = [240, 280, 360] as const;
export const MAX_SPECS = 12;

type Errors = Record<string, string>;

const inRange = (value: unknown, min: number, max: number, step = 1) =>
  typeof value === "number" && Number.isFinite(value) && value >= min && value <= max && Math.abs(value / step - Math.round(value / step)) < 1e-9;

const oneOf = <T>(value: unknown, list: readonly T[]) => list.includes(value as T);

const text = (errors: Errors, key: string, value: unknown, label: string, max = 80) => {
  if (typeof value !== "string" || value.trim().length === 0) errors[key] = `Укажите ${label}`;
  else if (value.length > max) errors[key] = `Не длиннее ${max} символов`;
};

export function validateComponent(c: PcComponent): Errors {
  const errors: Errors = {};
  if (!oneOf(c.category, COMPONENT_CATEGORIES)) return { category: "Неизвестная категория" };
  text(errors, "brand", c.brand, "бренд", 40);
  text(errors, "name", c.name, "название");
  if (c.image !== undefined && (typeof c.image !== "string" || c.image.length > 500 || !IMAGE_URL_PATTERN.test(c.image)))
    errors.image = "Ссылка на фото: https://… или путь /images/…";
  if (c.imageCredit !== undefined && (typeof c.imageCredit !== "string" || c.imageCredit.length > 200))
    errors.imageCredit = "Подпись к фото — до 200 символов";
  if (c.outOfStock !== undefined && typeof c.outOfStock !== "boolean") errors.outOfStock = "Некорректное значение";
  if (!inRange(c.powerDraw, 0, 1000)) errors.powerDraw = "Потребление — целое число от 0 до 1000 Вт";

  const stock = Object.fromEntries(CITIES.map((city) => [city, c.stock?.[city] ?? NaN])) as Record<City, number>;
  Object.assign(errors, validateOfferPatch({ price: c.price, stock }));

  const specs = Object.entries(c.specs ?? {});
  if (specs.length > MAX_SPECS) errors.specs = `Не больше ${MAX_SPECS} характеристик`;
  else if (specs.some(([k, v]) => !k.trim() || !String(v).trim() || k.length > 40 || String(v).length > 60))
    errors.specs = "Каждая строка: «Название: значение», до 40 и 60 символов";

  switch (c.category) {
    case "cpu":
      if (!oneOf(c.socket, SOCKETS)) errors.socket = "Выберите сокет";
      break;
    case "motherboard":
      if (!oneOf(c.socket, SOCKETS)) errors.socket = "Выберите сокет";
      if (!oneOf(c.memoryType, MEMORY_TYPES)) errors.memoryType = "Выберите тип памяти";
      if (!oneOf(c.formFactor, FORM_FACTORS)) errors.formFactor = "Выберите форм-фактор";
      break;
    case "gpu":
      if (!inRange(c.lengthMm, 120, 450)) errors.lengthMm = "Длина 120–450 мм";
      if (!inRange(c.slots, 1, 4, 0.5)) errors.slots = "Толщина 1–4 слота, шаг 0.5";
      if (!oneOf(c.fans, [2, 3])) errors.fans = "2 или 3 вентилятора";
      if (!oneOf(c.powerConnector, ["8-pin", "12V-2x6"])) errors.powerConnector = "Выберите разъём";
      break;
    case "ram":
      if (!oneOf(c.memoryType, MEMORY_TYPES)) errors.memoryType = "Выберите тип памяти";
      if (!oneOf(c.sticks, [2, 4])) errors.sticks = "2 или 4 модуля";
      break;
    case "storage":
      if (!oneOf(c.pcieGen, [4, 5])) errors.pcieGen = "PCIe 4.0 или 5.0";
      break;
    case "cooling":
      if (!inRange(c.capacityW, 50, 500)) errors.capacityW = "Рассеивание 50–500 Вт";
      if (c.kind === "air") {
        if (!inRange(c.heightMm, 30, 200)) errors.heightMm = "Высота 30–200 мм";
      } else if (c.kind === "aio") {
        if (!oneOf(c.radiatorMm, RADIATOR_SIZES)) errors.radiatorMm = "Радиатор 240, 280 или 360 мм";
      } else errors.kind = "Выберите тип охлаждения";
      break;
    case "psu":
      if (!inRange(c.wattage, 200, 3000)) errors.wattage = "Мощность 200–3000 Вт";
      break;
    case "case":
      if (!Array.isArray(c.formFactors) || c.formFactors.length === 0 || !c.formFactors.every((f) => oneOf(f, FORM_FACTORS)))
        errors.formFactors = "Отметьте хотя бы один форм-фактор";
      if (!inRange(c.maxGpuLengthMm, 120, 600)) errors.maxGpuLengthMm = "120–600 мм";
      if (!inRange(c.maxCoolerHeightMm, 30, 250)) errors.maxCoolerHeightMm = "30–250 мм";
      if (!Array.isArray(c.radiatorsMm) || !c.radiatorsMm.every((r) => oneOf(r, RADIATOR_SIZES)))
        errors.radiatorsMm = "Допустимы 240, 280, 360";
      if (!oneOf(c.color, ["black", "white"])) errors.color = "Выберите цвет";
      break;
  }
  return errors;
}

export function makeComponentId(category: string, name: string, taken: ReadonlySet<string>): string {
  const translit: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
    н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ы: "y",
    э: "e", ю: "yu", я: "ya",
  };
  const slug = name
    .toLowerCase()
    .replace(/[а-яё]/g, (ch) => translit[ch] ?? "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const base = `${category}-${slug || "item"}`;
  let id = base;
  for (let n = 2; taken.has(id); n += 1) id = `${base}-${n}`;
  return id;
}
