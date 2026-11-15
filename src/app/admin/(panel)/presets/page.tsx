import Link from "next/link";
import { container } from "@/infrastructure/container";
import { formatPrice } from "@/presentation/lib/format";
import { PageTitle } from "../PageTitle";

export default async function PresetsPage() {
  const presets = await container.getPresetBuilds.execute();
  return (
    <>
      <PageTitle
        title="Готовые сборки"
        description="Показываются на главной в блоке «Готовые сборки» и в конструкторе"
        actions={
          <Link href="/admin/presets/new" className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-medium text-bg no-underline hover:bg-accent">
            + Новая сборка
          </Link>
        }
      />
      {presets.length === 0 ? (
        <p className="rounded-panel border border-dashed border-line-strong bg-bg p-10 text-center text-sm text-muted">Сборок нет.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {presets.map((p) => (
            <Link key={p.id} href={`/admin/presets/${p.id}`} className="grid gap-3 rounded-panel border border-line bg-bg p-5 text-ink no-underline transition-colors hover:border-ink">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted">{p.tagline}</p>
                  <h2 className="text-xl font-medium tracking-[-0.02em]">{p.title}</h2>
                </div>
                {!p.summary.isValid && <span className="rounded-full bg-danger/10 px-2.5 py-1 text-xs text-danger">Требует внимания</span>}
              </div>
              <p className="text-sm text-muted">{p.purpose}</p>
              <ul className="grid gap-1 text-sm">
                {[p.selection.cpu, p.selection.gpu, p.selection.ram].map((c) => c && <li key={c.id}>{c.brand} {c.name}</li>)}
              </ul>
              <p className="font-mono text-sm">{formatPrice(p.summary.total)}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
