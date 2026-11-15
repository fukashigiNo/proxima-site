import type { ReactNode } from "react";
import { cn } from "@/presentation/lib/cn";

export function StatCard({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: string; tone?: "accent" | "danger" }) {
  return (
    <div className="grid gap-1 rounded-panel border border-line bg-bg p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted">{label}</p>
      <p className={cn("text-[28px] font-medium tracking-[-0.03em]", tone === "accent" && "text-accent", tone === "danger" && "text-danger")}>
        {value}
      </p>
      {hint && <p className="text-[13px] text-muted">{hint}</p>}
    </div>
  );
}
