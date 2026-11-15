"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { cn } from "@/presentation/lib/cn";
import { useNearViewport } from "@/presentation/hooks/useNearViewport";
import { useUserActivation } from "@/presentation/hooks/useUserActivation";
import type PcSceneType from "./PcScene";

const PcScene = dynamic(() => import("./PcScene"), { ssr: false, loading: () => <ScenePlaceholder /> });

/** Лёгкая заглушка до запуска 3D: силуэт корпуса на CSS, без JS и WebGL. */
export function ScenePlaceholder() {
  return (
    <div className="grid size-full place-items-center" aria-hidden>
      <div className="relative aspect-[0.92] h-[56%] max-h-[420px] rounded-md border border-line-strong bg-surface/60">
        <div className="absolute inset-x-[8%] bottom-[8%] h-[18%] rounded-sm bg-line" />
        <div className="absolute right-[6%] top-[10%] grid h-[62%] w-[12%] content-between">
          <span className="aspect-square rounded-full border-2 border-accent/50" />
          <span className="aspect-square rounded-full border-2 border-accent/50" />
          <span className="aspect-square rounded-full border-2 border-accent/50" />
        </div>
      </div>
    </div>
  );
}

/**
 * Обёртка сцены: место под холст резервируется сразу (без сдвигов вёрстки),
 * а three.js загружается и WebGL создаётся только когда блок подходит к экрану
 * и пользователь начал взаимодействовать со страницей (см. useUserActivation).
 */
export function PcSceneLazy({ className, ...props }: ComponentProps<typeof PcSceneType>) {
  const [ref, near] = useNearViewport<HTMLDivElement>();
  const activated = useUserActivation();
  return (
    <div ref={ref} className={cn("relative", className)}>
      {near && activated ? <PcScene {...props} className="size-full" /> : <ScenePlaceholder />}
    </div>
  );
}
