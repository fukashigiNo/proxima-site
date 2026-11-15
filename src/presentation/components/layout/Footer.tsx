import Link from "next/link";
import { Container } from "../ui/Layout";
import { SITE_NAV } from "./nav";

export function Footer() {
  return (
    <footer className="border-t border-line py-12">
      <Container className="grid gap-8 text-sm sm:grid-cols-[1fr_auto]">
        <div className="grid gap-2">
          <p className="font-semibold tracking-[-0.02em]">Proxima Computers</p>
          <p className="text-muted">Сборка и тестирование ПК · Алматы · Астана · Шымкент</p>
          <p className="text-muted">© {new Date().getFullYear()}</p>
        </div>
        <nav className="grid content-start gap-2 sm:justify-items-end" aria-label="Разделы сайта">
          <Link href="/" className="text-muted no-underline hover:text-ink">Главная</Link>
          {SITE_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted no-underline hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
