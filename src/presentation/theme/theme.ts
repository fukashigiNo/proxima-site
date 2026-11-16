export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "proxima-theme";

export const THEME_INIT_SCRIPT = `document.documentElement.dataset.js="";try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export const resolveTheme = (): Theme => {
  const explicit = document.documentElement.dataset.theme;
  return explicit === "light" ? "light" : "dark";
};

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  root.dataset.theme = theme;
  window.setTimeout(() => root.classList.remove("theme-transition"), 350);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
  }
};
