import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A minimal CSS-only tooltip — no positioning library, no portal, no
 * JS. Wraps a single focusable/hoverable child and shows `label` above
 * it on hover or keyboard focus. Deliberately simple: for a rail icon
 * or a truncated label, not a replacement for a real popover when one
 * is needed (a dropdown menu, a multi-line explanation).
 */
export function Tooltip({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border-strong bg-background-elevated px-2.5 py-1.5 text-xs text-foreground opacity-0 shadow-elevation-floating transition-opacity delay-300 group-hover:opacity-100 group-focus-within:opacity-100 group-focus-within:delay-0"
      >
        {label}
      </span>
    </span>
  );
}
