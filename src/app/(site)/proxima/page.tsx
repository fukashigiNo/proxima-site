import type { Metadata } from "next";
import { Reveal } from "@/presentation/components/motion/Reveal";
import { OrderButton } from "@/presentation/components/order/OrderButton";
import { LinkButton } from "@/presentation/components/ui/Button";
import { ProximaJourney, type JourneyStation } from "@/presentation/components/sections/ProximaJourney";
import { Container } from "@/presentation/components/ui/Layout";

export const metadata: Metadata = {
  title: "Proxima — вы нашли нас",
  description: "Секретный отсек Proxima Computers.",
  robots: { index: false, follow: false },
};

const BELIEFS = [
  {
    index: "01",
    title: "Совместимость без «наверное»",
    text: "Сокет, память, габариты, питание — каждая сборка проходит те же проверки, что и конструктор на сайте. Если что-то не сходится, мы скажем до покупки, а не после.",
  },
  {
    index: "02",
    title: "Руками, а не конвейером",
    text: "Каждый ПК собирает человек: укладывает кабели, настраивает BIOS и кривые вентиляторов так, будто собирает себе.",
  },
  {
    index: "03",
    title: "Тест до того, как ПК у вас",
    text: "72 часа под нагрузкой — процессор, видеокарта, память. Проблемы должны найтись у нас на стенде, а не у вас дома.",
  },
  {
    index: "04",
    title: "Только то, что есть рядом",
    text: "Подбираем из наличия в Алматы, Астане и Шымкенте. Цены в тенге, без «приедет через месяц».",
  },
];

const COORDINATES = [
  { value: "4,24", label: "световых года до Проксимы Центавра" },
  { value: "72 ч", label: "стресс-теста каждой сборки" },
  { value: "3 года", label: "гарантии на нашу работу" },
  { value: "3 города", label: "Алматы · Астана · Шымкент" },
];

const STATIONS: JourneyStation[] = [
  {
    index: "00",
    title: "Вы нашли Проксиму.",
    text: "Проксима Центавра — ближайшая к Солнцу звезда. Она так тусклая, что её не видно невооружённым глазом, и всё же ближе неё нет никого. Прокрутите — облетим её систему.",
    primary: true,
  },
  {
    index: "01",
    title: "Почему Proxima",
    text: "Proxima по-латински — «ближайшая». Мы хотим быть ближайшими к тем, кто собирает компьютер: не магазином коробок, а людьми, которые разберутся в задаче, подберут железо и соберут так, чтобы о нём можно было забыть на годы.",
  },
  ...BELIEFS.map((b, i) => ({ index: String(i + 2).padStart(2, "0"), title: b.title, text: b.text })),
  {
    index: String(BELIEFS.length + 2).padStart(2, "0"),
    title: "Координаты",
    stats: COORDINATES,
  },
];

export default function ProximaPage() {
  return (
    <>
      <div className="motion-reduce:hidden">
        <ProximaJourney stations={STATIONS} />
      </div>
      <Container className="hidden gap-12 pb-20 pt-10 motion-reduce:grid">
        {STATIONS.map((s) => (
          <section key={s.index} className="grid gap-3">
            <span className="font-mono text-[12px] tracking-[0.14em] text-accent-2">[ {s.index} ]</span>
            {s.primary ? (
              <h1 className="text-[clamp(40px,6vw,80px)] font-semibold leading-[0.95] tracking-[-0.045em]">{s.title}</h1>
            ) : (
              <h2 className="text-[clamp(26px,3vw,40px)] font-semibold tracking-[-0.035em]">{s.title}</h2>
            )}
            {s.text && <p className="max-w-[640px] leading-relaxed text-muted">{s.text}</p>}
            {s.stats && (
              <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {s.stats.map((x) => (
                  <div key={x.label}>
                    <dt className="text-[40px] font-semibold tracking-[-0.04em] text-accent">{x.value}</dt>
                    <dd className="text-muted">{x.label}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        ))}
      </Container>

      <Container className="pb-28 pt-16">
        <Reveal className="rounded-panel">
          <div className="grid gap-8 rounded-panel bg-surface/75 px-8 py-12 sm:px-12 md:grid-cols-[1fr_auto] md:items-center">
            <div className="grid gap-3">
              <p className="text-[clamp(26px,3vw,38px)] font-semibold leading-tight tracking-[-0.03em]">
                Об этой странице знают только те, кто смотрит на звёзды.
              </p>
              <p className="text-muted">Напишите нам «Проксима» в чате — нам будет приятно узнать, что вы её нашли.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <OrderButton selection={{}}>
                Написать нам
              </OrderButton>
              <LinkButton href="/" variant="ghost">
                Вернуться на Землю
              </LinkButton>
            </div>
          </div>
        </Reveal>
      </Container>
    </>
  );
}
