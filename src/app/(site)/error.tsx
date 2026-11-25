"use client";

import { useEffect } from "react";
import { buttonClass } from "@/presentation/components/ui/Button";
import { Container } from "@/presentation/components/ui/Layout";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="grid min-h-[60vh] content-center justify-items-start gap-5 py-20">
      <h1 className="max-w-[600px] text-[clamp(28px,3.4vw,44px)] font-semibold leading-tight tracking-[-0.03em]">
        Что-то пошло не так
      </h1>
      <p className="max-w-[520px] text-muted">
        Страница не загрузилась до конца. Обычно помогает просто попробовать ещё раз. Если не помогло, обновите страницу.
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass("primary")} onClick={reset}>
          Попробовать ещё раз
        </button>
        <a href="/" className={buttonClass("ghost")}>
          На главную
        </a>
      </div>
    </Container>
  );
}
