"use client";

import { useSyncExternalStore } from "react";
import { applyThemePreference, readThemePreference, subscribeToTheme, type ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/cn";

const OPTIONS: { value: ThemePreference; label: string; icon: (p: { className?: string }) => React.ReactNode }[] = [
  { value: "system", label: "System", icon: MonitorIcon },
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
];

/**
 * The Appearance control: System / Light / Dark as one segmented
 * switch, the pattern GitHub, Vercel and Linear settle on. It lives in
 * menus and footers rather than the header, because choosing a theme is
 * a once-a-visit setting, not a primary action.
 *
 * The server can't know the visitor's choice, so nothing is marked as
 * selected until hydration (`null` snapshot) rather than guessing.
 */
export function ThemeSwitcher({
  className,
  showLabels = false,
  label = "Appearance",
}: {
  className?: string;
  /** Show "System / Light / Dark" text beside the icons. */
  showLabels?: boolean;
  /** Visible caption to the left of the control; pass null to hide it. */
  label?: string | null;
}) {
  const pref = useSyncExternalStore<ThemePreference | null>(subscribeToTheme, readThemePreference, () => null);

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {label && <span className="text-sm text-foreground-muted">{label}</span>}
      <div
        role="group"
        aria-label="Appearance"
        className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface-subtle p-0.5"
      >
        {OPTIONS.map(({ value, label: optionLabel, icon: Icon }) => {
          const selected = pref === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              aria-label={showLabels ? undefined : optionLabel}
              title={optionLabel}
              onClick={() => applyThemePreference(value)}
              className={cn(
                "focus-ring inline-flex h-8 items-center justify-center gap-1.5 rounded-full text-[0.8125rem] transition-colors",
                showLabels ? "px-3" : "w-8",
                selected
                  ? "bg-surface text-foreground shadow-[var(--shadow-elevation-raised)]"
                  : "text-foreground-subtle hover:text-foreground"
              )}
            >
              <Icon className="h-[15px] w-[15px]" />
              {showLabels && <span>{optionLabel}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="12.5" rx="1.75" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 20.5h6M12 16.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
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
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
