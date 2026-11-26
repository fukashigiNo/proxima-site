import Link from "next/link";
import { BUSINESS } from "@/presentation/content/business";
import { CONTACTS } from "@/presentation/content/contacts";
import { Logo, SLOGAN } from "../brand/Logo";
import { Container } from "../ui/Layout";
import { SITE_NAV } from "./nav";

const LINK = "text-muted no-underline transition-colors hover:text-ink";

export function Footer() {
  const contacts = [
    BUSINESS.phone && { label: BUSINESS.phone, href: `tel:${BUSINESS.phone.replace(/[^\d+]/g, "")}` },
    CONTACTS.whatsapp && { label: "WhatsApp", href: `https://wa.me/${CONTACTS.whatsapp}` },
    CONTACTS.telegram && { label: `Telegram @${CONTACTS.telegram}`, href: `https://t.me/${CONTACTS.telegram}` },
    BUSINESS.instagram && { label: `Instagram @${BUSINESS.instagram.replace(/^@/, "")}`, href: `https://instagram.com/${BUSINESS.instagram.replace(/^@/, "")}` },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="border-t border-line pb-10 pt-14 text-[15px]">
      <Container className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_auto]">
        <div className="grid content-start gap-3">
          <Link href="/" className="w-fit" aria-label="Proxima Computers, на главную">
            <Logo className="text-[26px]" />
          </Link>
          <p className="text-[17px] tracking-[-0.01em] text-muted">{SLOGAN}</p>
          <p className="max-w-[320px] text-muted">
            Собираем и настраиваем компьютеры в {BUSINESS.baseCity}. Доставляем {BUSINESS.delivery}.
          </p>
        </div>

        <div className="grid content-start gap-2">
          <p className="mb-1 font-semibold">Связаться</p>
          {contacts.map((c) => (
            <a key={c.href} href={c.href} className={LINK} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
              {c.label}
            </a>
          ))}
          {contacts.length === 0 && (
            <Link href="/order" className={LINK}>
              Оставить заявку на сайте
            </Link>
          )}
          {BUSINESS.address && <p className="text-muted">{BUSINESS.address}</p>}
          {BUSINESS.workHours && <p className="text-muted">{BUSINESS.workHours}</p>}
        </div>

        <nav className="grid content-start gap-2" aria-label="Разделы сайта">
          <p className="mb-1 font-semibold">Разделы</p>
          {SITE_NAV.map((item) => (
            <Link key={item.href} href={item.href} className={LINK}>
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>

      <Container className="mt-12 flex flex-wrap justify-between gap-3 text-[13px] text-muted">
        <span>
          © {new Date().getFullYear()} {BUSINESS.name}
          {BUSINESS.legal && `, ${BUSINESS.legal}`}
        </span>
        <span>Цены на сайте в тенге и обновляются по наличию</span>
      </Container>
    </footer>
  );
}
