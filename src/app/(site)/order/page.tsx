import type { Metadata } from "next";
import { container } from "@/infrastructure/container";
import { OrderSummary } from "@/presentation/components/sections/OrderSummary";
import { RequestForm } from "@/presentation/components/sections/RequestForm";
import { Container, PageIntro } from "@/presentation/components/ui/Layout";
import { parseParts, parseTitle } from "@/presentation/lib/routes";
import { BuildProvider } from "@/presentation/state/BuildContext";

export const metadata: Metadata = {
  alternates: { canonical: "/order" },
  title: "Заявка — Proxima Computers",
  description: "Оставьте заявку на сборку ПК: ответим в течение часа в рабочее время и зафиксируем цену.",
};

interface Props {
  searchParams: Promise<{ parts?: string; title?: string }>;
}

export default async function OrderPage({ searchParams }: Props) {
  const { parts, title } = await searchParams;
  const selection = await container.resolveBuild.execute(parseParts(parts));

  return (
    <BuildProvider initial={selection} initialTitle={parseTitle(title)}>
      <PageIntro
        eyebrow="Заявка"
        title="Оставить заявку"
        description="Напишите, как с вами связаться и что нужно. Ответим в рабочее время, уточним детали и зафиксируем цену."
      />
      <Container className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 pb-24 md:grid-cols-2">
        <div className="animate-rise [animation-delay:240ms]">
          <RequestForm />
        </div>
        <div className="animate-rise [animation-delay:340ms]">
          <OrderSummary />
        </div>
      </Container>
    </BuildProvider>
  );
}
