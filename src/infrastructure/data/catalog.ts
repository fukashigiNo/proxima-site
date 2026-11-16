import type { PresetBuild } from "@/domain/entities/Build";
import type { PcComponent, Stock } from "@/domain/entities/PcComponent";

const s = (almaty: number, astana: number, shymkent: number): Stock => ({ almaty, astana, shymkent });

export const COMPONENTS: readonly PcComponent[] = [
  { id: "cpu-7500f", category: "cpu", brand: "AMD", name: "Ryzen 5 7500F", price: 62_000, powerDraw: 65, socket: "AM5", stock: s(14, 9, 4), specs: { Ядра: "6 / 12", Частота: "до 5.0 ГГц" } },
  { id: "cpu-9600x", category: "cpu", brand: "AMD", name: "Ryzen 5 9600X", price: 105_000, powerDraw: 105, socket: "AM5", stock: s(8, 5, 2), specs: { Ядра: "6 / 12", Частота: "до 5.4 ГГц" } },
  { id: "cpu-9700x", category: "cpu", brand: "AMD", name: "Ryzen 7 9700X", price: 150_000, powerDraw: 105, socket: "AM5", stock: s(6, 4, 0), specs: { Ядра: "8 / 16", Частота: "до 5.5 ГГц" } },
  { id: "cpu-9800x3d", category: "cpu", brand: "AMD", name: "Ryzen 7 9800X3D", price: 245_000, powerDraw: 120, socket: "AM5", stock: s(5, 3, 1), specs: { Ядра: "8 / 16", Частота: "до 5.2 ГГц", Кэш: "96 МБ L3" } },
  { id: "cpu-9950x3d", category: "cpu", brand: "AMD", name: "Ryzen 9 9950X3D", price: 390_000, powerDraw: 170, socket: "AM5", stock: s(2, 1, 0), specs: { Ядра: "16 / 32", Частота: "до 5.7 ГГц", Кэш: "128 МБ L3" } },
  { id: "cpu-14400f", category: "cpu", brand: "Intel", name: "Core i5-14400F", price: 72_000, powerDraw: 148, socket: "LGA1700", stock: s(12, 10, 6), specs: { Ядра: "10 / 16", Частота: "до 4.7 ГГц" } },
  { id: "cpu-14700kf", category: "cpu", brand: "Intel", name: "Core i7-14700KF", price: 175_000, powerDraw: 253, socket: "LGA1700", stock: s(4, 3, 1), specs: { Ядра: "20 / 28", Частота: "до 5.6 ГГц" } },
  { id: "cpu-265k", category: "cpu", brand: "Intel", name: "Core Ultra 7 265K", price: 180_000, powerDraw: 250, socket: "LGA1851", stock: s(3, 2, 0), specs: { Ядра: "20 / 20", Частота: "до 5.5 ГГц" } },

  { id: "mb-b650m", category: "motherboard", brand: "ASRock", name: "B650M Pro RS", price: 62_000, powerDraw: 0, socket: "AM5", memoryType: "DDR5", formFactor: "mATX", pcieGen5M2: true, stock: s(10, 6, 3), specs: { Чипсет: "B650", Формат: "mATX" } },
  { id: "mb-b650", category: "motherboard", brand: "MSI", name: "MAG B650 Tomahawk WiFi", price: 112_000, powerDraw: 0, socket: "AM5", memoryType: "DDR5", formFactor: "ATX", pcieGen5M2: false, stock: s(6, 4, 1), specs: { Чипсет: "B650", Формат: "ATX", "Wi‑Fi": "6E" } },
  { id: "mb-b650i", category: "motherboard", brand: "ASUS", name: "ROG Strix B650E-I", price: 155_000, powerDraw: 0, socket: "AM5", memoryType: "DDR5", formFactor: "ITX", pcieGen5M2: true, stock: s(2, 1, 0), specs: { Чипсет: "B650E", Формат: "Mini‑ITX" } },
  { id: "mb-x870e", category: "motherboard", brand: "ASUS", name: "ROG Strix X870E-E", price: 260_000, powerDraw: 0, socket: "AM5", memoryType: "DDR5", formFactor: "ATX", pcieGen5M2: true, stock: s(3, 2, 0), specs: { Чипсет: "X870E", Формат: "ATX", "Wi‑Fi": "7" } },
  { id: "mb-b760m-d4", category: "motherboard", brand: "Gigabyte", name: "B760M DS3H DDR4", price: 48_000, powerDraw: 0, socket: "LGA1700", memoryType: "DDR4", formFactor: "mATX", pcieGen5M2: false, stock: s(15, 11, 7), specs: { Чипсет: "B760", Формат: "mATX" } },
  { id: "mb-z790", category: "motherboard", brand: "MSI", name: "PRO Z790-P WiFi", price: 105_000, powerDraw: 0, socket: "LGA1700", memoryType: "DDR5", formFactor: "ATX", pcieGen5M2: false, stock: s(5, 4, 2), specs: { Чипсет: "Z790", Формат: "ATX" } },
  { id: "mb-b860", category: "motherboard", brand: "ASUS", name: "TUF Gaming B860-Plus WiFi", price: 112_000, powerDraw: 0, socket: "LGA1851", memoryType: "DDR5", formFactor: "ATX", pcieGen5M2: true, stock: s(3, 2, 1), specs: { Чипсет: "B860", Формат: "ATX" } },

  { id: "gpu-5060", category: "gpu", brand: "NVIDIA", name: "GeForce RTX 5060 8 ГБ", price: 185_000, powerDraw: 145, lengthMm: 240, slots: 2, fans: 2, powerConnector: "8-pin", stock: s(12, 8, 5), specs: { Память: "8 ГБ GDDR7", Длина: "240 мм" } },
  { id: "gpu-9060xt", category: "gpu", brand: "AMD", name: "Radeon RX 9060 XT 16 ГБ", price: 215_000, powerDraw: 160, lengthMm: 250, slots: 2, fans: 2, powerConnector: "8-pin", stock: s(7, 5, 2), specs: { Память: "16 ГБ GDDR6", Длина: "250 мм" } },
  { id: "gpu-5060ti", category: "gpu", brand: "NVIDIA", name: "GeForce RTX 5060 Ti 16 ГБ", price: 235_000, powerDraw: 180, lengthMm: 265, slots: 2, fans: 2, powerConnector: "8-pin", stock: s(9, 6, 3), specs: { Память: "16 ГБ GDDR7", Длина: "265 мм" } },
  { id: "gpu-5070", category: "gpu", brand: "NVIDIA", name: "GeForce RTX 5070 12 ГБ", price: 310_000, powerDraw: 250, lengthMm: 300, slots: 2.5, fans: 3, powerConnector: "12V-2x6", stock: s(6, 4, 2), specs: { Память: "12 ГБ GDDR7", Длина: "300 мм" } },
  { id: "gpu-9070xt", category: "gpu", brand: "AMD", name: "Radeon RX 9070 XT 16 ГБ", price: 360_000, powerDraw: 304, lengthMm: 320, slots: 3, fans: 3, powerConnector: "8-pin", stock: s(4, 3, 1), specs: { Память: "16 ГБ GDDR6", Длина: "320 мм" } },
  { id: "gpu-5070ti", category: "gpu", brand: "NVIDIA", name: "GeForce RTX 5070 Ti 16 ГБ", price: 455_000, powerDraw: 300, lengthMm: 330, slots: 3, fans: 3, powerConnector: "12V-2x6", stock: s(4, 2, 1), specs: { Память: "16 ГБ GDDR7", Длина: "330 мм" } },
  { id: "gpu-5080", category: "gpu", brand: "NVIDIA", name: "GeForce RTX 5080 16 ГБ", price: 650_000, powerDraw: 360, lengthMm: 340, slots: 3, fans: 3, powerConnector: "12V-2x6", stock: s(2, 1, 0), specs: { Память: "16 ГБ GDDR7", Длина: "340 мм" } },
  { id: "gpu-5090", category: "gpu", brand: "NVIDIA", name: "GeForce RTX 5090 32 ГБ", price: 1_450_000, powerDraw: 575, lengthMm: 358, slots: 3.5, fans: 3, powerConnector: "12V-2x6", stock: s(1, 1, 0), specs: { Память: "32 ГБ GDDR7", Длина: "358 мм" } },

  { id: "ram-d4-32", category: "ram", brand: "Kingston", name: "Fury Beast DDR4 32 ГБ (2×16)", price: 42_000, powerDraw: 8, memoryType: "DDR4", sticks: 2, stock: s(20, 14, 9), specs: { Частота: "3600 МТ/с", Тайминги: "CL18" } },
  { id: "ram-d5-32", category: "ram", brand: "Kingston", name: "Fury Beast DDR5 32 ГБ (2×16)", price: 55_000, powerDraw: 10, memoryType: "DDR5", sticks: 2, stock: s(18, 12, 6), specs: { Частота: "6000 МТ/с", Тайминги: "CL30" } },
  { id: "ram-d5-64", category: "ram", brand: "G.Skill", name: "Trident Z5 DDR5 64 ГБ (2×32)", price: 110_000, powerDraw: 12, memoryType: "DDR5", sticks: 2, stock: s(6, 3, 1), specs: { Частота: "6000 МТ/с", Тайминги: "CL30" } },
  { id: "ram-d5-64x4", category: "ram", brand: "Corsair", name: "Vengeance DDR5 64 ГБ (4×16)", price: 118_000, powerDraw: 16, memoryType: "DDR5", sticks: 4, stock: s(4, 2, 0), specs: { Частота: "6000 МТ/с", Тайминги: "CL36" } },
  { id: "ram-d5-96", category: "ram", brand: "Corsair", name: "Dominator Titanium DDR5 96 ГБ (2×48)", price: 165_000, powerDraw: 14, memoryType: "DDR5", sticks: 2, stock: s(2, 1, 0), specs: { Частота: "6000 МТ/с", Тайминги: "CL30" } },

  { id: "ssd-nv3-1tb", category: "storage", brand: "Kingston", name: "NV3 1 ТБ", price: 34_000, powerDraw: 5, pcieGen: 4, stock: s(30, 22, 12), specs: { Интерфейс: "PCIe 4.0", Чтение: "6000 МБ/с" } },
  { id: "ssd-990pro-2tb", category: "storage", brand: "Samsung", name: "990 Pro 2 ТБ", price: 95_000, powerDraw: 7, pcieGen: 4, stock: s(9, 6, 3), specs: { Интерфейс: "PCIe 4.0", Чтение: "7450 МБ/с" } },
  { id: "ssd-t705-2tb", category: "storage", brand: "Crucial", name: "T705 2 ТБ", price: 145_000, powerDraw: 10, pcieGen: 5, stock: s(3, 1, 0), specs: { Интерфейс: "PCIe 5.0", Чтение: "14500 МБ/с" } },
  { id: "ssd-sn850x-4tb", category: "storage", brand: "WD", name: "Black SN850X 4 ТБ", price: 165_000, powerDraw: 8, pcieGen: 4, stock: s(4, 2, 1), specs: { Интерфейс: "PCIe 4.0", Чтение: "7300 МБ/с" } },

  { id: "cool-ag400", category: "cooling", brand: "DeepCool", name: "AG400", price: 12_000, powerDraw: 3, kind: "air", heightMm: 150, capacityW: 220, stock: s(25, 18, 10), specs: { Тип: "Башенный", Высота: "150 мм", Рассеивание: "220 Вт" } },
  { id: "cool-pa120", category: "cooling", brand: "Thermalright", name: "Peerless Assassin 120 SE", price: 21_000, powerDraw: 4, kind: "air", heightMm: 155, capacityW: 245, stock: s(16, 10, 5), specs: { Тип: "Двухбашенный", Высота: "155 мм", Рассеивание: "245 Вт" } },
  { id: "cool-nhd15", category: "cooling", brand: "Noctua", name: "NH-D15 G2", price: 78_000, powerDraw: 4, kind: "air", heightMm: 168, capacityW: 280, stock: s(2, 1, 0), specs: { Тип: "Двухбашенный", Высота: "168 мм", Рассеивание: "280 Вт" } },
  { id: "cool-lf240", category: "cooling", brand: "Arctic", name: "Liquid Freezer III 240", price: 45_000, powerDraw: 8, kind: "aio", radiatorMm: 240, capacityW: 280, stock: s(8, 6, 2), specs: { Тип: "СЖО", Радиатор: "240 мм", Рассеивание: "280 Вт" } },
  { id: "cool-lf360", category: "cooling", brand: "Arctic", name: "Liquid Freezer III 360", price: 60_000, powerDraw: 10, kind: "aio", radiatorMm: 360, capacityW: 330, stock: s(6, 4, 1), specs: { Тип: "СЖО", Радиатор: "360 мм", Рассеивание: "330 Вт" } },
  { id: "cool-galahad", category: "cooling", brand: "Lian Li", name: "Galahad II Trinity 360", price: 98_000, powerDraw: 12, kind: "aio", radiatorMm: 360, capacityW: 350, stock: s(3, 2, 0), specs: { Тип: "СЖО", Радиатор: "360 мм", Рассеивание: "350 Вт" } },

  { id: "psu-650", category: "psu", brand: "DeepCool", name: "PK650D 650W", price: 29_000, powerDraw: 0, wattage: 650, native12V2x6: false, stock: s(22, 15, 9), specs: { Сертификат: "80+ Bronze", Разъём: "8‑pin PCIe" } },
  { id: "psu-750", category: "psu", brand: "MSI", name: "MAG A750GL PCIE5", price: 45_000, powerDraw: 0, wattage: 750, native12V2x6: true, stock: s(10, 7, 3), specs: { Сертификат: "80+ Gold", Разъём: "12V‑2x6" } },
  { id: "psu-850", category: "psu", brand: "Corsair", name: "RM850x (2024)", price: 72_000, powerDraw: 0, wattage: 850, native12V2x6: true, stock: s(7, 5, 2), specs: { Сертификат: "80+ Gold", Разъём: "12V‑2x6" } },
  { id: "psu-1000", category: "psu", brand: "Seasonic", name: "Vertex GX-1000", price: 98_000, powerDraw: 0, wattage: 1000, native12V2x6: true, stock: s(3, 2, 1), specs: { Сертификат: "80+ Gold", Разъём: "12V‑2x6" } },
  { id: "psu-1300", category: "psu", brand: "Seasonic", name: "Prime TX-1300", price: 185_000, powerDraw: 0, wattage: 1300, native12V2x6: true, stock: s(1, 1, 0), specs: { Сертификат: "80+ Titanium", Разъём: "12V‑2x6" } },

  { id: "case-air100", category: "case", brand: "Montech", name: "Air 100 ARGB", price: 28_000, powerDraw: 0, formFactors: ["mATX", "ITX"], maxGpuLengthMm: 330, maxCoolerHeightMm: 161, radiatorsMm: [240, 280], color: "black", stock: s(12, 8, 4), specs: { Формат: "mATX", "Макс. GPU": "330 мм", "Макс. кулер": "161 мм" } },
  { id: "case-ch560", category: "case", brand: "DeepCool", name: "CH560 Digital", price: 45_000, powerDraw: 0, formFactors: ["ATX", "mATX", "ITX"], maxGpuLengthMm: 380, maxCoolerHeightMm: 175, radiatorsMm: [240, 280, 360], color: "black", stock: s(9, 6, 3), specs: { Формат: "ATX", "Макс. GPU": "380 мм", "Макс. кулер": "175 мм" } },
  { id: "case-nr200p", category: "case", brand: "Cooler Master", name: "NR200P V2 White", price: 52_000, powerDraw: 0, formFactors: ["ITX"], maxGpuLengthMm: 336, maxCoolerHeightMm: 155, radiatorsMm: [240, 280], color: "white", stock: s(3, 2, 0), specs: { Формат: "Mini‑ITX", "Макс. GPU": "336 мм", "Макс. кулер": "155 мм" } },
  { id: "case-north", category: "case", brand: "Fractal Design", name: "North", price: 75_000, powerDraw: 0, formFactors: ["ATX", "mATX", "ITX"], maxGpuLengthMm: 355, maxCoolerHeightMm: 170, radiatorsMm: [240, 280, 360], color: "black", stock: s(4, 3, 1), specs: { Формат: "ATX", "Макс. GPU": "355 мм", "Макс. кулер": "170 мм" } },
  { id: "case-o11v", category: "case", brand: "Lian Li", name: "O11 Vision White", price: 88_000, powerDraw: 0, formFactors: ["ATX", "mATX", "ITX"], maxGpuLengthMm: 455, maxCoolerHeightMm: 167, radiatorsMm: [240, 280, 360], color: "white", stock: s(5, 3, 1), specs: { Формат: "ATX", "Макс. GPU": "455 мм", "Макс. кулер": "167 мм" } },
];

export const PRESETS: readonly PresetBuild[] = [
  {
    id: "core",
    title: "Proxima Core",
    tagline: "Для игр в 1080p и 1440p",
    purpose: "Тянет почти всё на высоких настройках, тихий и без переплат. Хороший вариант для первого игрового ПК или учёбы.",
    componentIds: ["cpu-7500f", "mb-b650m", "gpu-5060ti", "ram-d5-32", "ssd-nv3-1tb", "cool-pa120", "psu-650", "case-ch560"],
  },
  {
    id: "orbit",
    title: "Proxima Orbit",
    tagline: "Для 4K и стримов",
    purpose: "Для тех, кто хочет играть в 4K или стримить без просадок. X3D-процессор и RTX 5070 Ti с запасом на пару лет.",
    componentIds: ["cpu-9800x3d", "mb-b650", "gpu-5070ti", "ram-d5-64", "ssd-990pro-2tb", "cool-lf360", "psu-850", "case-north"],
  },
  {
    id: "zenith",
    title: "Proxima Zenith",
    tagline: "Для 3D, монтажа и нейросетей",
    purpose: "Когда компьютер зарабатывает деньги: рендер, монтаж 4K и локальные нейросети. Дорого, но время на рендере окупает.",
    componentIds: ["cpu-9950x3d", "mb-x870e", "gpu-5090", "ram-d5-96", "ssd-t705-2tb", "cool-galahad", "psu-1300", "case-o11v"],
  },
];
