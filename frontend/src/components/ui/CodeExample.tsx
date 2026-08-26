"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export interface CodeExampleTab {
  label: string;
  code: string;
}

export interface CodeExampleProps {
  tabs: CodeExampleTab[];
  className?: string;
}

/**
 * Tabbed code-sample panel (JavaScript / Python / cURL, etc). Purely
 * illustrative — it does not execute anything.
 */
export function CodeExample({ tabs, className }: CodeExampleProps) {
  const [active, setActive] = useState(0);

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border-strong bg-surface shadow-glow-sm", className)}>
      <div className="flex items-center gap-1 border-b border-border bg-background-elevated px-2 py-2">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={active === i}
            className={cn(
              "focus-ring press-feedback cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors",
              active === i
                ? "bg-surface text-foreground"
                : "text-foreground-subtle hover:text-foreground-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed text-foreground-muted">
        <code>{tabs[active].code}</code>
      </pre>
    </div>
  );
}
