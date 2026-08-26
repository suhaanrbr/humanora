"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme, type ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/cn";

const options: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

/**
 * Theme switcher: a sun/moon icon button that opens an accessible menu
 * with Light / Dark / System. Supports mouse, keyboard (Escape, arrow
 * navigation via native focus order), and outside-click dismissal.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Theme: ${preference === "system" ? `System (${resolvedTheme})` : preference}`}
        aria-expanded={open}
        aria-haspopup="menu"
        title="Change theme"
        className="theme-toggle-button focus-ring press-feedback relative flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-foreground-muted transition-colors hover:border-brand-purple/40 hover:text-foreground hover:shadow-glow-sm"
      >
        <span
          aria-hidden="true"
          className="bg-brand-gradient pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
          style={{ opacity: resolvedTheme === "dark" ? 0.16 : 0.1 }}
        />
        <SunIcon
          className={cn(
            "relative h-4 w-4 transition-[transform,opacity] duration-300 motion-safe:ease-out",
            resolvedTheme === "dark"
              ? "absolute -rotate-90 scale-50 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
        />
        <MoonIcon
          className={cn(
            "relative h-4 w-4 transition-[transform,opacity] duration-300 motion-safe:ease-out",
            resolvedTheme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "absolute rotate-90 scale-50 opacity-0"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Theme options"
          className="pearl-glass absolute right-0 top-full mt-2 w-36 rounded-lg p-1.5"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={preference === option.value}
              onClick={() => {
                setPreference(option.value);
                setOpen(false);
              }}
              className={cn(
                "focus-ring flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                preference === option.value
                  ? "bg-background-elevated text-foreground"
                  : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
              )}
            >
              {option.label}
              {preference === option.value && <CheckIcon className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
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
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
