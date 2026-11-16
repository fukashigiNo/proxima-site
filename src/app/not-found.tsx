import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/presentation/components/layout/Footer";
import { Header } from "@/presentation/components/layout/Header";
import { Ambient } from "@/presentation/components/motion/Ambient";
import { MotionProvider } from "@/presentation/components/motion/MotionProvider";
import { OrderModalProvider } from "@/presentation/components/order/OrderModal";
import { LinkButton } from "@/presentation/components/ui/Button";
import { Container } from "@/presentation/components/ui/Layout";
import { Note } from "@/presentation/components/ui/Note";

export const metadata: Metadata = {
  title: "Страница не найдена — Proxima Computers",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <MotionProvider>
      <OrderModalProvider>
        <Ambient />
        <Header />
        <main className="grid min-h-[70vh] place-items-center pt-[var(--header-h)]">
          <Container className="grid justify-items-start gap-6 py-20">
            <p className="text-[clamp(80px,14vw,180px)] font-semibold leading-none tracking-[-0.06em] text-accent">404</p>
            <h1 className="max-w-[640px] text-[clamp(28px,3.4vw,44px)] font-semibold leading-tight tracking-[-0.03em]">
              Такой страницы нет. Похоже, она улетела куда-то дальше Проксимы.
            </h1>
            <p className="max-w-[520px] text-muted">
              Возможно, ссылка устарела или в адресе опечатка. Начните с главной или загляните в конструктор.
            </p>
            <div className="relative flex flex-wrap gap-3">
              <LinkButton href="/">На главную</LinkButton>
              <LinkButton href="/builder" variant="ghost">
                В конструктор
              </LinkButton>
              <span className="absolute left-full top-1/2 ml-20 -translate-y-1/2 whitespace-nowrap max-md:hidden">
                <Note arrow="left" rotate={-6}>
                  или поищите звезду
                </Note>
              </span>
            </div>
          </Container>
        </main>
        <Footer />
      </OrderModalProvider>
    </MotionProvider>
  );
}
