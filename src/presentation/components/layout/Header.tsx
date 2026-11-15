import Link from "next/link";
import { ThemeToggle } from "@/presentation/theme/ThemeToggle";
import { Container } from "../ui/Layout";
import { NavLinks } from "./NavLinks";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/95">
      <Container className="flex h-[68px] items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.02em] text-ink no-underline"
          aria-label="Proxima Computers — на главную"
        >
          <span className="size-3.5 rounded-full bg-accent ring-4 ring-accent/20" aria-hidden />
          Proxima<span className="-ml-1 hidden font-normal text-muted min-[421px]:inline">Computers</span>
        </Link>
        <NavLinks className="hidden gap-8 min-[961px]:flex" />
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/builder"
            className="hidden whitespace-nowrap rounded-full border border-line-strong px-[18px] py-[9px] text-sm font-medium text-ink no-underline transition-colors hover:border-ink min-[361px]:inline-block"
          >
            Собрать ПК
          </Link>
        </div>
      </Container>
      {/* На узких экранах меню — горизонтальная лента под шапкой */}
      <NavLinks
        className="flex gap-6 overflow-x-auto border-t border-line px-4 py-3 [scrollbar-width:none] sm:px-8 min-[961px]:hidden"
        linkClassName="text-[13px]"
      />
    </header>
  );
}
