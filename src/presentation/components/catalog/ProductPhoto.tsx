import { CATEGORY_LABELS, type PcComponent } from "@/domain/entities/PcComponent";
import { cn } from "@/presentation/lib/cn";

export function ProductPhoto({ item, className, priority, credit = "overlay" }: { item: PcComponent; className?: string; priority?: boolean; credit?: "overlay" | "none" }) {
  return (
    <div className={cn("relative grid place-items-center overflow-hidden rounded-[12px] bg-white", className)}>
      {item.image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt={`${item.brand} ${item.name}`}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            referrerPolicy="no-referrer"
            className="size-full object-contain p-[6%]"
          />
          {credit === "overlay" && item.imageCredit && (
            <span className="absolute inset-x-0 bottom-0 truncate bg-black/45 px-2 py-0.5 text-[9px] leading-tight text-white/85" title={item.imageCredit}>
              {item.imageCredit}
            </span>
          )}
        </>
      ) : (
        <span className="px-3 text-center text-[11px] uppercase tracking-[0.08em] text-neutral-500">{CATEGORY_LABELS[item.category]}</span>
      )}
    </div>
  );
}
