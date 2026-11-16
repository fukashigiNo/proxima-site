import { BUSINESS, daysWord, yearsWord } from "./business";

export const SERVICE_FACTS = [
  { value: `${BUSINESS.testHours} ч`, label: "гоняем под нагрузкой каждую сборку" },
  { value: `${BUSINESS.warrantyYears} ${yearsWord(BUSINESS.warrantyYears)}`, label: "гарантии на нашу работу" },
  { value: `${BUSINESS.buildDays} ${daysWord(BUSINESS.buildDays)}`, label: "обычно от заявки до готового ПК" },
];
