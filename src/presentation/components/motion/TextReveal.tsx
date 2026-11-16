"use client";

import * as m from "motion/react-m";
import { Fragment, type ElementType } from "react";

export function TextReveal({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  accent = [],
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  accent?: string[];
}) {
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top" aria-hidden>
            <m.span
              className={`inline-block ${accent.includes(word) ? "text-accent" : ""}`}
              initial={{ y: "110%", rotate: 4 }}
              whileInView={{ y: "0%", rotate: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: delay + i * 0.05 }}
            >
              {word}
            </m.span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
