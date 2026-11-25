"use client";

import Link from "next/link";
import { useState } from "react";
import { createComponent, deleteComponent, saveComponent } from "@/app/admin/actions";
import { FORM_FACTORS, MEMORY_TYPES, RADIATOR_SIZES, SOCKETS } from "@/domain/entities/ComponentRules";
import {
  CATEGORY_LABELS,
  CITIES,
  CITY_LABELS,
  COMPONENT_CATEGORIES,
  type ComponentCategory,
  type PcComponent,
} from "@/domain/entities/PcComponent";
import { Button } from "../ui/Button";
import { Check, Field, FormSection, FormStatus, NumberInput, Select, TextArea, TextInput, opts } from "./fields";
import { useFormAction } from "./useFormAction";

const read = (c: PcComponent | undefined, key: string): unknown => (c as unknown as Record<string, unknown> | undefined)?.[key];
const val = (c: PcComponent | undefined, key: string, fallback: string | number = "") => {
  const v = read(c, key);
  return v === undefined || v === null ? fallback : String(v);
};
const has = (c: PcComponent | undefined, key: string, item: string | number, fallback: boolean) => {
  const v = read(c, key);
  return Array.isArray(v) ? v.includes(item) : fallback;
};

const specsText = (c?: PcComponent) =>
  c ? Object.entries(c.specs).map(([k, v]) => `${k}: ${v}`).join("\n") : "";

interface Props {
  component?: PcComponent;
  defaultCategory?: ComponentCategory;
  usedInPresets?: string[];
  created?: boolean;
}

export function ComponentForm({ component, defaultCategory = "cpu", usedInPresets = [], created }: Props) {
  const isEdit = Boolean(component);
  const [category, setCategory] = useState<ComponentCategory>(component?.category ?? defaultCategory);
  const [coolingKind, setCoolingKind] = useState(val(component, "kind", "air"));
  const [image, setImage] = useState(String(val(component, "image")));
  const save = useFormAction(isEdit ? saveComponent : createComponent);
  const remove = useFormAction(deleteComponent, `Удалить «${component?.name}» из каталога? Это действие нельзя отменить.`);
  const e = save.state.fields ?? {};
  const c = component;

  return (
    <div className="grid max-w-4xl gap-4">
      <form onSubmit={save.onSubmit} className="grid gap-4" noValidate>
        {c && <input type="hidden" name="id" value={c.id} />}
        {created && !save.state.message && <FormStatus ok message="Позиция создана" />}
        <FormStatus message={save.state.message} ok={save.state.ok} />

        <FormSection title="Основное">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Категория" error={e.category} hint={isEdit ? "Категорию нельзя изменить" : undefined}>
              {isEdit ? (
                <>
                  <input type="hidden" name="category" value={category} />
                  <TextInput value={CATEGORY_LABELS[category]} disabled readOnly />
                </>
              ) : (
                <Select
                  name="category"
                  value={category}
                  onChange={(ev) => setCategory(ev.target.value as ComponentCategory)}
                  options={opts(COMPONENT_CATEGORIES, (v) => CATEGORY_LABELS[v])}
                />
              )}
            </Field>
            <Field label="Бренд" error={e.brand}>
              <TextInput name="brand" defaultValue={val(c, "brand")} invalid={Boolean(e.brand)} placeholder="AMD" />
            </Field>
            <Field label="Название" error={e.name} className="sm:col-span-2">
              <TextInput name="name" defaultValue={val(c, "name")} invalid={Boolean(e.name)} placeholder="Ryzen 7 9800X3D" />
            </Field>
            <Field label="Цена, ₸" error={e.price}>
              <NumberInput name="price" defaultValue={val(c, "price")} invalid={Boolean(e.price)} />
            </Field>
            <Field label="Потребление, Вт" error={e.powerDraw} hint="TDP процессора или TBP видеокарты; 0 — если не потребляет">
              <NumberInput name="powerDraw" defaultValue={val(c, "powerDraw", 0)} invalid={Boolean(e.powerDraw)} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Фото">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px] sm:items-start">
            <Field label="Ссылка на фото" error={e.image} hint="https://… — фото с сайта производителя или из своего хранилища">
              <TextInput name="image" value={image} onChange={(ev) => setImage(ev.target.value)} invalid={Boolean(e.image)} placeholder="https://…" />
            </Field>
            <Field label="Автор и лицензия фото" error={e.imageCredit} hint="Обязательно для фото с Wikimedia и других CC-лицензий, показывается под фото" className="sm:col-start-1">
              <TextInput name="imageCredit" defaultValue={val(c, "imageCredit")} invalid={Boolean(e.imageCredit)} placeholder="Фото: Автор, CC BY-SA 4.0, Wikimedia Commons" />
            </Field>
            <div className="grid aspect-square place-items-center overflow-hidden rounded-card border border-line bg-surface-2 text-xs text-muted">
              {/^https:\/\/|^\//.test(image) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="size-full object-contain p-2" referrerPolicy="no-referrer" />
              ) : (
                "нет фото"
              )}
            </div>
          </div>
        </FormSection>

        <FormSection title="Наличие по городам">
          <Check name="outOfStock" label="Нет в наличии — скрыть остатки и показывать «нет в наличии»" defaultChecked={read(c, "outOfStock") === true} />
          <div className="grid grid-cols-3 gap-4">
            {CITIES.map((city) => (
              <Field key={city} label={CITY_LABELS[city]} error={e[`stock.${city}`]}>
                <NumberInput name={`stock.${city}`} defaultValue={c?.stock[city] ?? 0} invalid={Boolean(e[`stock.${city}`])} />
              </Field>
            ))}
          </div>
        </FormSection>

        <FormSection key={category} title="Параметры для совместимости и 3D">
          <div className="grid gap-4 sm:grid-cols-2">
            {(category === "cpu" || category === "motherboard") && (
              <Field label="Сокет" error={e.socket}>
                <Select name="socket" defaultValue={val(c, "socket", SOCKETS[0])} options={opts(SOCKETS)} invalid={Boolean(e.socket)} />
              </Field>
            )}
            {(category === "motherboard" || category === "ram") && (
              <Field label="Тип памяти" error={e.memoryType}>
                <Select name="memoryType" defaultValue={val(c, "memoryType", "DDR5")} options={opts(MEMORY_TYPES)} />
              </Field>
            )}
            {category === "motherboard" && (
              <>
                <Field label="Форм-фактор" error={e.formFactor}>
                  <Select name="formFactor" defaultValue={val(c, "formFactor", "ATX")} options={opts(FORM_FACTORS)} />
                </Field>
                <div className="flex items-end pb-2">
                  <Check name="pcieGen5M2" label="Есть слот M.2 PCIe 5.0" defaultChecked={read(c, "pcieGen5M2") === true} />
                </div>
              </>
            )}
            {category === "gpu" && (
              <>
                <Field label="Длина, мм" error={e.lengthMm}>
                  <NumberInput name="lengthMm" defaultValue={val(c, "lengthMm", 300)} invalid={Boolean(e.lengthMm)} />
                </Field>
                <Field label="Толщина, слотов" error={e.slots}>
                  <NumberInput name="slots" defaultValue={val(c, "slots", 2.5)} invalid={Boolean(e.slots)} />
                </Field>
                <Field label="Вентиляторов" error={e.fans}>
                  <Select name="fans" defaultValue={val(c, "fans", 3)} options={opts([2, 3])} />
                </Field>
                <Field label="Разъём питания" error={e.powerConnector}>
                  <Select name="powerConnector" defaultValue={val(c, "powerConnector", "8-pin")} options={opts(["8-pin", "12V-2x6"])} />
                </Field>
              </>
            )}
            {category === "ram" && (
              <Field label="Модулей в комплекте" error={e.sticks}>
                <Select name="sticks" defaultValue={val(c, "sticks", 2)} options={opts([2, 4])} />
              </Field>
            )}
            {category === "storage" && (
              <Field label="Интерфейс" error={e.pcieGen}>
                <Select name="pcieGen" defaultValue={val(c, "pcieGen", 4)} options={opts([4, 5], (v) => `PCIe ${v}.0`)} />
              </Field>
            )}
            {category === "cooling" && (
              <>
                <Field label="Тип" error={e.kind}>
                  <Select
                    name="kind"
                    value={coolingKind}
                    onChange={(ev) => setCoolingKind(ev.target.value)}
                    options={[
                      { value: "air", label: "Башенный кулер" },
                      { value: "aio", label: "СЖО" },
                    ]}
                  />
                </Field>
                <Field label="Рассеивание, Вт" error={e.capacityW}>
                  <NumberInput name="capacityW" defaultValue={val(c, "capacityW", 250)} invalid={Boolean(e.capacityW)} />
                </Field>
                {coolingKind === "air" ? (
                  <Field label="Высота, мм" error={e.heightMm}>
                    <NumberInput name="heightMm" defaultValue={val(c, "heightMm", 155)} invalid={Boolean(e.heightMm)} />
                  </Field>
                ) : (
                  <Field label="Радиатор, мм" error={e.radiatorMm}>
                    <Select name="radiatorMm" defaultValue={val(c, "radiatorMm", 360)} options={opts(RADIATOR_SIZES)} />
                  </Field>
                )}
              </>
            )}
            {category === "psu" && (
              <>
                <Field label="Мощность, Вт" error={e.wattage}>
                  <NumberInput name="wattage" defaultValue={val(c, "wattage", 750)} invalid={Boolean(e.wattage)} />
                </Field>
                <div className="flex items-end pb-2">
                  <Check name="native12V2x6" label="Есть разъём 12V‑2x6" defaultChecked={read(c, "native12V2x6") === true} />
                </div>
              </>
            )}
            {category === "case" && (
              <>
                <Field label="Поддерживаемые платы" error={e.formFactors}>
                  <div className="flex h-10 items-center gap-4">
                    {FORM_FACTORS.map((f) => (
                      <Check key={f} name="formFactors" value={f} label={f} defaultChecked={has(c, "formFactors", f, true)} />
                    ))}
                  </div>
                </Field>
                <Field label="Радиаторы СЖО, мм" error={e.radiatorsMm}>
                  <div className="flex h-10 items-center gap-4">
                    {RADIATOR_SIZES.map((r) => (
                      <Check key={r} name="radiatorsMm" value={r} label={String(r)} defaultChecked={has(c, "radiatorsMm", r, true)} />
                    ))}
                  </div>
                </Field>
                <Field label="Макс. длина видеокарты, мм" error={e.maxGpuLengthMm}>
                  <NumberInput name="maxGpuLengthMm" defaultValue={val(c, "maxGpuLengthMm", 380)} invalid={Boolean(e.maxGpuLengthMm)} />
                </Field>
                <Field label="Макс. высота кулера, мм" error={e.maxCoolerHeightMm}>
                  <NumberInput name="maxCoolerHeightMm" defaultValue={val(c, "maxCoolerHeightMm", 170)} invalid={Boolean(e.maxCoolerHeightMm)} />
                </Field>
                <Field label="Цвет" error={e.color}>
                  <Select name="color" defaultValue={val(c, "color", "black")} options={[{ value: "black", label: "Чёрный" }, { value: "white", label: "Белый" }]} />
                </Field>
              </>
            )}
          </div>
        </FormSection>

        <FormSection title="Характеристики для витрины">
          <Field label="По одной на строку: «Название: значение»" error={e.specs}>
            <TextArea name="specs" defaultValue={specsText(c)} invalid={Boolean(e.specs)} placeholder={"Ядра: 8 / 16\nЧастота: до 5.2 ГГц"} />
          </Field>
        </FormSection>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={save.pending}>
            {save.pending ? "Сохраняем…" : isEdit ? "Сохранить изменения" : "Создать позицию"}
          </Button>
          <Link href={`/admin/catalog?category=${category}`} className="text-sm text-muted no-underline hover:text-ink">
            К списку
          </Link>
        </div>
      </form>

      {c && (
        <FormSection title="Удаление">
          {usedInPresets.length > 0 ? (
            <p className="text-sm text-muted">
              Позиция входит в готовые сборки ({usedInPresets.join(", ")}). Чтобы удалить её, сначала замените её в этих сборках.
            </p>
          ) : (
            <form onSubmit={remove.onSubmit} className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="category" value={c.category} />
              <button
                type="submit"
                disabled={remove.pending}
                className="h-10 rounded-full border border-danger px-5 text-sm text-danger transition-colors hover:bg-danger hover:text-on-accent disabled:opacity-50"
              >
                Удалить позицию
              </button>
              <span className="text-xs text-muted">Заявки, где она была, сохранятся, но без этой позиции.</span>
              <FormStatus message={remove.state.message} />
            </form>
          )}
        </FormSection>
      )}
    </div>
  );
}
