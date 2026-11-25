"use client";

import dynamic from "next/dynamic";
import { SceneBoundary } from "./SceneBoundary";
import type { ComponentProps } from "react";
import { cn } from "@/presentation/lib/cn";
import { useNearViewport } from "@/presentation/hooks/useNearViewport";
import { useUserActivation } from "@/presentation/hooks/useUserActivation";
import type ComponentPreviewType from "./ComponentPreview";
import { ScenePlaceholder } from "./PcSceneLazy";

const ComponentPreview = dynamic(() => import("./ComponentPreview"), { ssr: false, loading: () => <ScenePlaceholder /> });

export function ComponentPreviewLazy({ className, ...props }: ComponentProps<typeof ComponentPreviewType>) {
  const [ref, near] = useNearViewport<HTMLDivElement>();
  const activated = useUserActivation();
  return (
    <div ref={ref} className={cn("relative", className)}>
      {near && activated ? (
        <SceneBoundary fallback={<ScenePlaceholder />}>
          <ComponentPreview {...props} className="size-full" />
        </SceneBoundary>
      ) : (
        <ScenePlaceholder />
      )}
    </div>
  );
}
