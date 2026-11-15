"use client";

import { useMemo, useState } from "react";
import { DEFAULT_FILTER, filterOffers, type OfferFilter } from "@/application/use-cases/FilterOffers";
import type { Catalog } from "@/application/use-cases/GetCatalog";
import type { PresetBuildView } from "@/application/use-cases/GetPresetBuilds";
import type { PcComponent } from "@/domain/entities/PcComponent";
import { useBuild } from "@/presentation/state/BuildContext";
import { AssemblyPanel } from "./AssemblyPanel";
import { CategoryTabs } from "./CategoryTabs";
import { Inspector } from "./Inspector";
import { OfferList } from "./OfferList";
import { Container } from "../ui/Layout";
import { Toolbar } from "./Toolbar";

interface Props {
  catalog: Catalog;
  presets: PresetBuildView[];
}

/** Конструктор: композиция независимых блоков, общее состояние — в BuildContext. */
export function Builder({ catalog, presets }: Props) {
  const { activeCategory, selection } = useBuild();
  const [filter, setFilter] = useState<OfferFilter>(DEFAULT_FILTER);
  const [inspected, setInspected] = useState<PcComponent | null>(null);

  const offers = useMemo(
    () => filterOffers<PcComponent>(catalog[activeCategory], filter),
    [catalog, activeCategory, filter],
  );
  const previewed = inspected?.category === activeCategory ? inspected : (selection[activeCategory] ?? offers[0] ?? null);

  return (
    <Container className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 pb-24 pt-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <AssemblyPanel />
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
        <Toolbar filter={filter} onFilterChange={setFilter} presets={presets} />
        <CategoryTabs />
        {previewed && <Inspector component={previewed} city={filter.city} />}
        <OfferList offers={offers} city={filter.city} onInspect={setInspected} />
      </div>
    </Container>
  );
}
