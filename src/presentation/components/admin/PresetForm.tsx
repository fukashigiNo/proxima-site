"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { deletePreset, savePreset } from "@/app/admin/actions";
import { evaluateBuild } from "@/application/use-cases/EvaluateBuild";
import type { Catalog } from "@/application/use-cases/GetCatalog";
import { selectComponent, type BuildSelection, type PresetBuild } from "@/domain/entities/Build";
import { CATEGORY_LABELS, COMPONENT_CATEGORIES, type ComponentCategory, type PcComponent } from "@/domain/entities/PcComponent";
import { cn } from "@/presentation/lib/cn";
import { formatPrice, formatWatts } from "@/presentation/lib/format";
import { Button } from "../ui/Button";
import { Field, FormSection, FormStatus, Select, TextInput } from "./fields";
import { useFormAction } from "./useFormAction";

/** Редактор готовой сборки: та же доменная проверка совместимости, что на сайте, — прямо в форме. */
export function PresetForm({ catalog, preset }: { catalog: Catalog; preset?: PresetBuild }) {
  const [ids, setIds] = useState<Partial<Record<ComponentCategory, string>>>(() => {
    const all: PcComponent[] = Object.values(catalog).flat();
    return Object.fromEntries(
      (preset?.componentIds ?? []).map((id) => all.find((c) => c.id === id)).filter(Boolean).map((c) => [c!.category, c!.id]),
    );
  });
  const save = useFormAction(savePreset);
  const remove = useFormAction(deletePreset, `Удалить сборку «${preset?.title}»? Она пропадёт с сайта.`);
  const e = save.state.fields ?? {};

  const summary = useMemo(() => {
    const selection = COMPONENT_CATEGORIES.reduce<BuildSelection>((acc, category) => {
      const found = (catalog[category] as PcComponent[]).find((c) => c.id === ids[category]);
      return found ? selectComponent(acc, found) : acc;
    }, {});
    return evaluateBuild(selection);
  }, [catalog, ids]);

  return (
    <div className="grid max-w-5xl gap-4">
      <form onSubmit={save.onSubmit} className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start" noValidate>
        {preset && <input type="hidden" name="id" value={preset.id} />}
        <div className="grid gap-4">
          <FormStatus message={save.state.message} ok={save.state.ok} />
          <FormSection title="Описание на витрине">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Название" error={e.title}>
                <TextInput name="title" defaultValue={preset?.title} invalid={Boolean(e.title)} placeholder="Proxima Nova" />
              </Field>
              <Field label="Подпись" error={e.tagline}>
                <TextInput name="tagline" defaultValue={preset?.tagline} invalid={Boolean(e.tagline)} placeholder="Игры в 1440p" />
              </Field>
              <Field label="Описание" error={e.purpose} className="sm:col-span-2">
                <TextInput name="purpose" defaultValue={preset?.purpose} invalid={Boolean(e.purpose)} />
              </Field>
            </div>
          </FormSection>
          <FormSection title="Комплектующие">
            <div className="grid gap-3">
              {COMPONENT_CATEGORIES.map((category) => (
                <Field
                  key={category}
                  label={CATEGORY_LABELS[category]}
                  error={e[`component.${category}`] ?? (summary.conflictCategories.includes(category) ? "Конфликт совместимости" : undefined)}
                >
                  <Select
                    name={`component.${category}`}
                    value={ids[category] ?? ""}
                    invalid={summary.conflictCategories.includes(category) || Boolean(e[`component.${category}`])}
                    onChange={(ev) => setIds((prev) => ({ ...prev, [category]: ev.target.value }))}
                    options={[
                      { value: "", label: "— не выбрано —" },
                      ...(catalog[category] as PcComponent[]).map((c) => ({ value: c.id, label: `${c.brand} ${c.name} — ${formatPrice(c.price)}` })),
                    ]}
                  />
                </Field>
              ))}
            </div>
          </FormSection>
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-6">
          <FormSection title="Проверка">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted">Итого со сборкой</dt>
                <dd className="text-xl font-medium">{formatPrice(summary.total)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Потребление</dt>
                <dd className="text-xl font-medium">{formatWatts(summary.powerDraw)}</dd>
              </div>
            </dl>
            <ul className="grid gap-1.5 text-sm">
              {summary.issues.map((i) => (
                <li key={i.rule} className={cn("rounded-lg px-3 py-2", i.severity === "error" ? "bg-danger/8 text-danger" : "bg-warning/12 text-warning-ink")}>
                  {i.message}
                </li>
              ))}
              {summary.missing.length > 0 && (
                <li className="px-3 text-muted">Не выбрано: {summary.missing.map((c) => CATEGORY_LABELS[c].toLowerCase()).join(", ")}</li>
              )}
              {summary.isValid && summary.issues.length === 0 && <li className="rounded-lg bg-success/10 px-3 py-2 text-success">Сборка полностью совместима</li>}
            </ul>
            {e.components && <p className="text-sm text-danger">{e.components}</p>}
            <Button type="submit" disabled={save.pending || !summary.isValid}>
              {save.pending ? "Сохраняем…" : preset ? "Сохранить сборку" : "Создать сборку"}
            </Button>
            {!summary.isValid && <p className="text-xs text-muted">Сохранить можно полную сборку без ошибок совместимости.</p>}
          </FormSection>
          <Link href="/admin/presets" className="text-sm text-muted no-underline hover:text-ink">
            ← Все сборки
          </Link>
        </aside>
      </form>

      {preset && (
        <FormSection title="Удаление">
          <form onSubmit={remove.onSubmit} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="id" value={preset.id} />
            <button
              type="submit"
              disabled={remove.pending}
              className="h-10 rounded-full border border-danger px-5 text-sm text-danger transition-colors hover:bg-danger hover:text-on-accent disabled:opacity-50"
            >
              Удалить сборку
            </button>
            <FormStatus message={remove.state.message} />
          </form>
        </FormSection>
      )}
    </div>
  );
}
