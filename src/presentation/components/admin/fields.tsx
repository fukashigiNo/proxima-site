import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/presentation/lib/cn";

const CONTROL =
  "w-full rounded-lg border border-line-strong bg-bg px-3 text-sm text-ink outline-none transition-colors focus:border-ink aria-invalid:border-danger";

export function Field({ label, error, hint, className, children }: { label: string; error?: string; hint?: string; className?: string; children: ReactNode }) {
  return (
    <label className={cn("grid content-start gap-1.5", className)}>
      <span className="text-[13px] text-muted">{label}</span>
      {children}
      {error ? <span className="text-xs text-danger">{error}</span> : hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function TextInput({ invalid, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input aria-invalid={invalid || undefined} className={cn(CONTROL, "h-10", className)} {...props} />;
}

export function NumberInput(props: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <TextInput inputMode="decimal" {...props} className={cn("font-mono", props.className)} />;
}

export function Select({ invalid, options, className, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean; options: readonly { value: string | number; label: string }[] }) {
  return (
    <select aria-invalid={invalid || undefined} className={cn(CONTROL, "h-10 cursor-pointer", className)} {...props}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function TextArea({ invalid, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea aria-invalid={invalid || undefined} className={cn(CONTROL, "min-h-24 resize-y py-2 font-mono", className)} {...props} />;
}

export function Check({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" className="size-4 accent-accent" {...props} />
      {label}
    </label>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 rounded-panel border border-line bg-bg p-5">
      <h2 className="font-medium">{title}</h2>
      {children}
    </section>
  );
}

export function FormStatus({ message, ok }: { message?: string; ok?: boolean }) {
  if (!message) return null;
  return (
    <p role={ok ? "status" : "alert"} className={cn("rounded-card px-4 py-2.5 text-sm", ok ? "bg-success/10 text-success" : "bg-danger/8 text-danger")}>
      {message}
    </p>
  );
}

const opts = <T extends string | number>(values: readonly T[], label: (v: T) => string = String) =>
  values.map((v) => ({ value: v, label: label(v) }));
export { opts };
