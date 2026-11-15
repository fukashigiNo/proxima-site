export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "proxima-theme";

/**
 * Выполняется в <head> до первой отрисовки: применяет сохранённый выбор, чтобы не было «мигания».
 * Без сохранённого выбора тема берётся из системы через CSS (prefers-color-scheme).
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export const resolveTheme = (): Theme => {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  root.dataset.theme = theme;
  window.setTimeout(() => root.classList.remove("theme-transition"), 350);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // приватный режим — тема просто не запомнится
  }
};
