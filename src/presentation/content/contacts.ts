const digits = (value?: string) => value?.replace(/\D/g, "") || null;
const username = (value?: string) => value?.trim().replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "") || null;

export const CONTACTS = {
  whatsapp: digits(process.env.NEXT_PUBLIC_WHATSAPP_PHONE),
  telegram: username(process.env.NEXT_PUBLIC_TELEGRAM_USERNAME),
} as const;

export const whatsappLink = (phone: string, text: string) =>
  `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;

export const telegramLink = (user: string, text: string) => `https://t.me/${user}?text=${encodeURIComponent(text)}`;
