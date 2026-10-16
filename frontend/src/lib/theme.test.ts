import { describe, expect, it } from "vitest";
import { THEME_INIT_SCRIPT, THEME_STORAGE_KEY } from "./theme";

type Listener = (e: { matches: boolean }) => void;

/** Runs the inline <head> script against a minimal fake browser. */
function runInitScript({
  stored,
  osLight,
  legacyMediaQuery = false,
}: {
  stored: string | null;
  osLight: boolean;
  /** Safari < 14: MediaQueryList has addListener but no addEventListener. */
  legacyMediaQuery?: boolean;
}) {
  const attrs: Record<string, string> = {};
  const listeners: Listener[] = [];
  const mediaQuery: Record<string, unknown> = { matches: osLight };
  if (legacyMediaQuery) mediaQuery.addListener = (fn: Listener) => listeners.push(fn);
  else mediaQuery.addEventListener = (_: string, fn: Listener) => listeners.push(fn);

  const document = {
    documentElement: {
      setAttribute: (name: string, value: string) => (attrs[name] = value),
      getAttribute: (name: string) => attrs[name] ?? null,
    },
  };
  const window = { matchMedia: () => mediaQuery };
  const localStorage = { getItem: (key: string) => (key === THEME_STORAGE_KEY ? stored : null) };

  new Function("document", "window", "localStorage", THEME_INIT_SCRIPT)(document, window, localStorage);
  return { attrs, osChange: (light: boolean) => listeners.forEach((fn) => fn({ matches: light })) };
}

describe("THEME_INIT_SCRIPT", () => {
  it("applies a stored choice over the device setting", () => {
    const { attrs } = runInitScript({ stored: "light", osLight: false });
    expect(attrs).toEqual({ "data-theme": "light", "data-theme-pref": "light" });
  });

  it("follows the device when nothing is stored", () => {
    expect(runInitScript({ stored: null, osLight: true }).attrs).toEqual({ "data-theme": "light", "data-theme-pref": "system" });
    expect(runInitScript({ stored: null, osLight: false }).attrs).toEqual({ "data-theme": "dark", "data-theme-pref": "system" });
  });

  it("treats an unknown stored value as system", () => {
    expect(runInitScript({ stored: "sepia", osLight: true }).attrs["data-theme-pref"]).toBe("system");
  });

  it("re-themes live on a device change while on system", () => {
    const { attrs, osChange } = runInitScript({ stored: null, osLight: true });
    osChange(false);
    expect(attrs["data-theme"]).toBe("dark");
  });

  it("ignores device changes once a palette is pinned", () => {
    const { attrs, osChange } = runInitScript({ stored: "light", osLight: true });
    osChange(false);
    expect(attrs["data-theme"]).toBe("light");
  });

  it("keeps a stored choice on older Safari (no addEventListener)", () => {
    const { attrs, osChange } = runInitScript({ stored: "light", osLight: false, legacyMediaQuery: true });
    expect(attrs["data-theme"]).toBe("light");
    const system = runInitScript({ stored: null, osLight: true, legacyMediaQuery: true });
    system.osChange(false);
    expect(system.attrs["data-theme"]).toBe("dark");
    osChange(true);
    expect(attrs["data-theme"]).toBe("light");
  });
});
