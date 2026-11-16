export const BUSINESS = {
  name: "Proxima Computers",
  baseCity: "Алматы",
  cities: ["Алматы", "Астана", "Шымкент"],
  delivery: "по Алматы, Астане, Шымкенту и в другие города Казахстана",

  testHours: 72,
  warrantyYears: 3,
  buildDays: 2,
  replyTime: "в течение часа",
  payment: ["Kaspi", "картой", "безналом для юрлиц"],

  since: null as number | null,
  buildsDone: null as number | null,
  workHours: null as string | null,
  phone: null as string | null,
  instagram: null as string | null,
  address: null as string | null,
  legal: null as string | null,
};

export const yearsWord = (n: number) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "год";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "года";
  return "лет";
};

export const daysWord = (n: number) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дня";
  return "дней";
};
