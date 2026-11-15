"use client";

import { useEffect, useState } from "react";
import { applyTheme, resolveTheme, type Theme } from "./theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(resolveTheme());
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => setTheme(resolveTheme());
    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  const toggle = () => {
    const next: Theme = resolveTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong bg-transparent text-ink transition-[border-color,transform] duration-300 hover:border-ink active:-rotate-[20deg] active:scale-95 data-[theme-state=unknown]:[&>svg]:opacity-0"
      onClick={toggle}
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
      data-theme-state={theme ?? "unknown"}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
        {isDark ? (
          <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
          </g>
        ) : (
          <path fill="currentColor" d="M20.3 14.6A8.5 8.5 0 0 1 9.4 3.7a8.5 8.5 0 1 0 10.9 10.9Z" />
        )}
      </svg>
    </button>
  );
}
