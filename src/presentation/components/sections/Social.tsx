import { REVIEWS } from "@/presentation/content/reviews";
import { SHOWCASE } from "@/presentation/content/showcase";
import { formatPrice } from "@/presentation/lib/format";
import { Reveal } from "../motion/Reveal";
import { Container, Section } from "../ui/Layout";

export function ShowcaseSection() {
  if (SHOWCASE.length === 0) return null;
  return (
    <Section>
      <Container>
        <h2 className="mb-3 text-[clamp(28px,3.4vw,44px)] font-semibold tracking-[-0.035em]">Что собирали недавно</h2>
        <p className="mb-10 max-w-[560px] text-muted">Живые сборки, которые уже уехали к людям.</p>
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {SHOWCASE.map((build, i) => (
            <Reveal key={`${build.title}-${i}`} delay={(i % 3) * 80} className={i % 3 === 1 ? "lg:mt-10" : undefined}>
              <article className="grid gap-3">
                {build.photo && (
                  <img
                    src={build.photo}
                    alt={build.title}
                    loading="lazy"
                    className="aspect-[4/5] w-full rounded-card object-cover"
                  />
                )}
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[19px] font-semibold">{build.title}</h3>
                  {build.price && <span className="whitespace-nowrap text-muted">{formatPrice(build.price)}</span>}
                </div>
                <p className="text-[15px] text-muted">
                  {build.purpose}
                  {build.city && `, ${build.city}`}
                  {build.date && `, ${build.date}`}
                </p>
                <ul className="text-[14px] leading-relaxed">
                  {build.parts.map((part) => (
                    <li key={part}>{part}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function ReviewsSection() {
  if (REVIEWS.length === 0) return null;
  return (
    <Section surface>
      <Container>
        <h2 className="mb-10 text-[clamp(28px,3.4vw,44px)] font-semibold tracking-[-0.035em]">Что пишут после покупки</h2>
        <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
          {REVIEWS.map((review, i) => (
            <figure key={`${review.name}-${i}`} className="mb-6 break-inside-avoid rounded-card border border-line bg-bg/60 p-6">
              <blockquote className="whitespace-pre-line leading-relaxed">{review.text}</blockquote>
              <figcaption className="mt-4 text-[14px] text-muted">
                {review.name}
                {review.city && `, ${review.city}`}
                {review.source &&
                  (review.link ? (
                    <>
                      {" · "}
                      <a href={review.link} target="_blank" rel="noopener noreferrer" className="text-muted underline-offset-4 hover:text-ink">
                        {review.source}
                      </a>
                    </>
                  ) : (
                    ` · ${review.source}`
                  ))}
                {review.date && ` · ${review.date}`}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
