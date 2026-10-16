export type Theme = "light" | "dark";
/** What the visitor chose: a fixed palette, or follow the device. */
export type ThemePreference = Theme | "system";

export const THEME_STORAGE_KEY = "humanora-theme";

/**
 * Runs inline in <head>, before first paint, so the page never flashes
 * the wrong palette. An explicit choice in localStorage wins; otherwise
 * the operating system's preference decides, and keeps deciding: while
 * the preference is "system", a change to the OS setting re-themes the
 * open page. <html data-theme-pref> records the choice so the
 * Appearance control can show it. Kept as a plain string so it can be
 * injected without bundling.
 */
export const THEME_INIT_SCRIPT = `(function(){var d=document.documentElement;try{var m=window.matchMedia("(prefers-color-scheme: light)");var t=localStorage.getItem("${THEME_STORAGE_KEY}");var p=t==="light"||t==="dark"?t:"system";d.setAttribute("data-theme-pref",p);d.setAttribute("data-theme",p==="system"?(m.matches?"light":"dark"):p);var f=function(e){if(d.getAttribute("data-theme-pref")==="system")d.setAttribute("data-theme",e.matches?"light":"dark")};m.addEventListener?m.addEventListener("change",f):m.addListener&&m.addListener(f)}catch(e){d.setAttribute("data-theme","dark")}})();`;

export function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function readThemePreference(): ThemePreference {
  const pref = document.documentElement.getAttribute("data-theme-pref");
  return pref === "light" || pref === "dark" ? pref : "system";
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applyThemePreference(pref: ThemePreference) {
  const root = document.documentElement;
  root.setAttribute("data-theme-pref", pref);
  root.setAttribute("data-theme", pref === "system" ? systemTheme() : pref);
  try {
    if (pref === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // Private mode or blocked storage: the choice still applies for this visit.
  }
}

/** Pin a palette explicitly (the one-click toggle). */
export function applyTheme(theme: Theme) {
  applyThemePreference(theme);
}

/** Notifies on any change to the theme or the stored preference, for useSyncExternalStore. */
export function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-theme-pref"] });
  return () => observer.disconnect();
}
