"use client";

import { useSyncExternalStore } from "react";
import { applyTheme, readTheme, subscribeToTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/cn";

/**
 * Switches between the light (paper) and dark (ink) palettes. The
 * server can't know the visitor's theme, so it renders the button
 * label-less until hydration (`null` snapshot) rather than guessing and
 * flickering.
 */
export function ThemeToggle({ className, showLabel = false }: { className?: string; showLabel?: boolean }) {
  const theme = useSyncExternalStore<Theme | null>(subscribeToTheme, readTheme, () => null);
  const next: Theme = theme === "light" ? "dark" : "light";
  const label = next === "light" ? "Light mode" : "Dark mode";

  return (
    <button
      type="button"
      onClick={() => applyTheme(next)}
      aria-label={`Switch to ${label.toLowerCase()}`}
      title={`Switch to ${label.toLowerCase()}`}
      className={cn(
        "focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-md text-foreground-muted transition-colors hover:text-foreground",
        showLabel ? "px-1 text-[0.9375rem]" : "w-9 hover:bg-surface-hover",
        className
      )}
    >
      {theme === null ? (
        <span className="h-[18px] w-[18px]" aria-hidden="true" />
      ) : theme === "light" ? (
        <MoonIcon className="h-[18px] w-[18px]" />
      ) : (
        <SunIcon className="h-[18px] w-[18px]" />
      )}
      {showLabel && theme !== null && <span>{label}</span>}
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
