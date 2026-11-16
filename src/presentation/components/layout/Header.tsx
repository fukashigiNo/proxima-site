import Link from "next/link";
import { ThemeToggle } from "@/presentation/theme/ThemeToggle";
import { Logo } from "../brand/Logo";
import { HeaderShell } from "../motion/HeaderShell";
import { Container } from "../ui/Layout";
import { NavLinks } from "./NavLinks";

export function Header() {
  return (
    <HeaderShell className="group/header fixed inset-x-0 top-0 z-50 bg-transparent transition-transform duration-500 ease-out-soft data-[hidden]:-translate-y-full has-[:focus-visible]:translate-y-0">
      <Container className="flex h-[68px] items-center justify-between gap-6 transition-[height] duration-300 group-data-[scrolled]/header:h-[58px]">
        <Link href="/" className="group flex shrink-0 items-center no-underline" aria-label="PRX comp — Proxima Computers, на главную">
          <Logo className="h-11 transition-[height] duration-300 group-data-[scrolled]/header:h-9" />
        </Link>
        <NavLinks className="hidden gap-8 min-[961px]:flex" />
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/builder"
            className="hidden whitespace-nowrap rounded-full border border-accent/60 px-[18px] py-[9px] text-sm font-medium text-ink no-underline transition-[background-color,box-shadow,color] duration-300 hover:bg-accent hover:text-on-accent hover:shadow-[0_0_24px_var(--glow)] min-[361px]:inline-block"
          >
            Собрать ПК
          </Link>
        </div>
      </Container>
      <NavLinks
        className="flex gap-6 overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:px-8 min-[961px]:hidden"
        linkClassName="text-[13px]"
      />
    </HeaderShell>
  );
}
