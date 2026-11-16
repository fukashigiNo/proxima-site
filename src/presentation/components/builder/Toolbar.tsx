"use client";

import type { OfferFilter, SortOrder } from "@/application/use-cases/FilterOffers";
import type { PresetBuildView } from "@/application/use-cases/GetPresetBuilds";
import { CITIES, CITY_LABELS, type City } from "@/domain/entities/PcComponent";
import { useBuild } from "@/presentation/state/BuildContext";

interface Props {
  filter: OfferFilter;
  onFilterChange: (filter: OfferFilter) => void;
  presets: PresetBuildView[];
}

export function Toolbar({ filter, onFilterChange, presets }: Props) {
  const { loadPreset, reset, presetTitle } = useBuild();
  const update = (patch: Partial<OfferFilter>) => onFilterChange({ ...filter, ...patch });

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-surface/70 pl-3.5 pr-1.5 text-sm">
          <span className="text-muted">Город</span>
          <select className="cursor-pointer border-0 bg-transparent pr-1 text-ink outline-none" value={filter.city} onChange={(e) => update({ city: e.target.value as City | "all" })}>
            <option value="all">Весь Казахстан</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {CITY_LABELS[city]}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-surface/70 pl-3.5 pr-1.5 text-sm">
          <span className="text-muted">Сортировка</span>
          <select className="cursor-pointer border-0 bg-transparent pr-1 text-ink outline-none" value={filter.sort} onChange={(e) => update({ sort: e.target.value as SortOrder })}>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
          </select>
        </label>
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 px-3.5 text-sm">
          <input className="size-4 accent-accent" type="checkbox" checked={filter.inStockOnly} onChange={(e) => update({ inStockOnly: e.target.checked })} />
          <span>Только в наличии</span>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[13px] text-muted">Начать с:</span>
        {presets.map((preset) => (
          <button
            key={preset.id}
            className="h-8 rounded-full border border-line bg-transparent px-3.5 text-[13px] text-ink transition-colors hover:border-line-strong aria-pressed:border-accent aria-pressed:bg-accent/15 aria-pressed:text-ink aria-pressed:shadow-[0_0_16px_-4px_var(--glow)]"
            aria-pressed={presetTitle === preset.title}
            onClick={() => loadPreset(preset.selection, preset.title)}
          >
            {preset.title.replace("Proxima ", "")}
          </button>
        ))}
        <button className="h-8 rounded-full border border-line bg-transparent px-3.5 text-[13px] text-ink transition-colors hover:border-line-strong aria-pressed:border-accent aria-pressed:bg-accent/15 aria-pressed:text-ink aria-pressed:shadow-[0_0_16px_-4px_var(--glow)]" onClick={reset}>
          С нуля
        </button>
      </div>
    </div>
  );
}
