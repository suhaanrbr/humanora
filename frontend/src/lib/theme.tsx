"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "humanora-theme";

interface ThemeContextValue {
  /** What the user picked: "light" | "dark" | "system". */
  preference: ThemePreference;
  /** What's actually applied right now ("system" resolved to light/dark). */
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  /** False until the client has read the real stored/DOM theme (see below). */
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function readStoredPreference(): ThemePreference {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;

  // Brief universal transition window (see globals.css .theme-transitioning)
  // so the swap reads as an intentional, quick fade rather than a hard cut.
  root.classList.add("theme-transitioning");
  root.setAttribute("data-theme", resolved);
  window.setTimeout(() => root.classList.remove("theme-transitioning"), 220);
}

/**
 * HUMANORA theme system. Wraps the app, tracks the user's preference
 * (persisted to localStorage) plus the currently-resolved light/dark
 * value, and keeps `<html data-theme>` in sync — including live updates
 * when the OS theme changes while "System" is selected.
 *
 * The actual paint is never wrong: an inline script in layout.tsx sets
 * `data-theme` on <html> synchronously before hydration, so the page
 * itself never flashes the wrong theme. This provider's React state,
 * however, MUST start from the same fixed values on the server and on
 * the client's first render (SSR has no access to localStorage/document),
 * or React throws a hydration mismatch the moment something (like
 * ThemeToggle's icon) renders differently. So state starts at a neutral
 * default and is corrected from the real DOM/localStorage inside
 * `useEffect`, which only ever runs on the client, after hydration.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = useState(false);

  // Runs once, client-only, synchronously after the DOM commits but before
  // the browser paints — corrects state from the real DOM/localStorage
  // without a visible flicker of the toggle's icon.
  /* eslint-disable react-hooks/set-state-in-effect --
     Deliberate: this is the one-time sync of React state from browser-only
     storage/DOM (localStorage, data-theme) that cannot be read during SSR
     or the initial client render without causing the hydration mismatch
     this effect exists to avoid. */
  useLayoutEffect(() => {
    const domTheme = document.documentElement.getAttribute("data-theme");
    setPreferenceState(readStoredPreference());
    setResolvedTheme(domTheme === "light" || domTheme === "dark" ? domTheme : getSystemTheme());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    const resolved = next === "system" ? getSystemTheme() : next;
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  // Keep in sync with OS-level changes while "System" is selected.
  useEffect(() => {
    if (!mounted || preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mounted, preference]);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, resolvedTheme, setPreference, mounted }),
    [preference, resolvedTheme, setPreference, mounted]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

/**
 * Blocking inline script, rendered before the app tree. Reads the stored
 * preference and sets `data-theme` synchronously so the very first paint
 * already matches the user's choice — no flash of the wrong theme, no
 * hydration mismatch (the DOM attribute is set before React hydrates,
 * and React's own tree never reads that attribute during render).
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("${STORAGE_KEY}");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
`;
