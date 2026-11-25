export const COMPONENT_CATEGORIES = [
  "cpu",
  "motherboard",
  "gpu",
  "ram",
  "storage",
  "cooling",
  "psu",
  "case",
] as const;

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];

export type Socket = "AM5" | "LGA1700" | "LGA1851";
export type MemoryType = "DDR4" | "DDR5";
export type FormFactor = "ATX" | "mATX" | "ITX";
export type GpuPowerConnector = "8-pin" | "12V-2x6";

export const CITIES = ["almaty", "astana", "shymkent"] as const;
export type City = (typeof CITIES)[number];
export const CITY_LABELS: Record<City, string> = {
  almaty: "Алматы",
  astana: "Астана",
  shymkent: "Шымкент",
};

export type Stock = Readonly<Partial<Record<City, number>>>;

interface BaseComponent<C extends ComponentCategory> {
  readonly id: string;
  readonly category: C;
  readonly brand: string;
  readonly name: string;
  readonly price: number;
  readonly powerDraw: number;
  readonly specs: Readonly<Record<string, string>>;
  readonly stock: Stock;
  readonly image?: string;
  readonly imageCredit?: string;
  readonly outOfStock?: boolean;
}

export interface Cpu extends BaseComponent<"cpu"> {
  readonly socket: Socket;
}

export interface Motherboard extends BaseComponent<"motherboard"> {
  readonly socket: Socket;
  readonly memoryType: MemoryType;
  readonly formFactor: FormFactor;
  readonly pcieGen5M2: boolean;
}

export interface Gpu extends BaseComponent<"gpu"> {
  readonly lengthMm: number;
  readonly slots: number;
  readonly fans: 2 | 3;
  readonly powerConnector: GpuPowerConnector;
}

export interface Ram extends BaseComponent<"ram"> {
  readonly memoryType: MemoryType;
  readonly sticks: 2 | 4;
}

export interface Storage extends BaseComponent<"storage"> {
  readonly pcieGen: 4 | 5;
}

export type Cooling =
  | (BaseComponent<"cooling"> & { readonly kind: "air"; readonly heightMm: number; readonly capacityW: number })
  | (BaseComponent<"cooling"> & { readonly kind: "aio"; readonly radiatorMm: 240 | 280 | 360; readonly capacityW: number });

export interface Psu extends BaseComponent<"psu"> {
  readonly wattage: number;
  readonly native12V2x6: boolean;
}

export interface PcCase extends BaseComponent<"case"> {
  readonly formFactors: readonly FormFactor[];
  readonly maxGpuLengthMm: number;
  readonly maxCoolerHeightMm: number;
  readonly radiatorsMm: readonly number[];
  readonly color: "black" | "white";
}

export type PcComponent = Cpu | Motherboard | Gpu | Ram | Storage | Cooling | Psu | PcCase;

export type ComponentOf<C extends ComponentCategory> = Extract<PcComponent, { category: C }>;

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  cpu: "Процессор",
  motherboard: "Материнская плата",
  gpu: "Видеокарта",
  ram: "Оперативная память",
  storage: "Накопитель",
  cooling: "Охлаждение",
  psu: "Блок питания",
  case: "Корпус",
};

export const warehouseStock = (component: PcComponent): number =>
  Object.values(component.stock).reduce((sum, n) => sum + (n ?? 0), 0);

export const totalStock = (component: PcComponent): number => (component.outOfStock ? 0 : warehouseStock(component));

export const stockIn = (component: PcComponent, city: City | "all"): number =>
  component.outOfStock ? 0 : city === "all" ? totalStock(component) : (component.stock[city] ?? 0);

export const IMAGE_URL_PATTERN = /^(https:\/\/[^\s"'<>]+|\/[\w\-./]+)$/;
