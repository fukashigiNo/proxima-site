import { Footer } from "@/presentation/components/layout/Footer";
import { Header } from "@/presentation/components/layout/Header";
import { Ambient } from "@/presentation/components/motion/Ambient";
import { MotionProvider } from "@/presentation/components/motion/MotionProvider";
import { OrderModalProvider } from "@/presentation/components/order/OrderModal";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
    <OrderModalProvider>
      <Ambient />
      <Header />
      <main className="min-h-[60vh] pt-[var(--header-h)]">{children}</main>
      <Footer />
    </OrderModalProvider>
    </MotionProvider>
  );
}
