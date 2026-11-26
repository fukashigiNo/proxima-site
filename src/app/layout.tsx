import type { Metadata, Viewport } from "next";
import { Caveat, Onest } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/presentation/theme/theme";
import "./globals.css";
import { SITE_URL } from "./siteUrl";

const sans = Onest({ subsets: ["latin", "cyrillic"], variable: "--font-onest", display: "swap" });
const hand = Caveat({ subsets: ["latin", "cyrillic"], weight: "600", variable: "--font-caveat", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Proxima Computers — сборка компьютеров на заказ",
  description: "Подбор комплектующих, сборка и 72-часовое тестирование игровых ПК и рабочих станций.",
  applicationName: "Proxima Computers",
  openGraph: {
    type: "website",
    locale: "ru_KZ",
    siteName: "Proxima Computers",
    title: "Proxima Computers — сборка компьютеров на заказ",
    description: "Соберите ПК из комплектующих в наличии в Казахстане: цены в тенге, 3D-модель и проверка совместимости.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#07090c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${sans.variable} ${hand.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
