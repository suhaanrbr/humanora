"use client";

import { cn } from "@/lib/cn";

export type BillingPeriod = "monthly" | "yearly";

export interface BillingToggleProps {
  period: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
  /** Approximate blended savings shown on the Yearly option, e.g. "25%". */
  savingsLabel?: string;
}

/**
 * Reusable Monthly/Yearly billing switch. Purely presentational + a
 * callback — the caller owns the `period` state and recomputes prices.
 */
export function BillingToggle({ period, onChange, savingsLabel }: BillingToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Billing period"
      className="mx-auto flex w-fit items-center gap-1 rounded-full border border-border bg-surface p-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={period === "monthly"}
        onClick={() => onChange("monthly")}
        className={cn(
          "focus-ring press-feedback cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          period === "monthly"
            ? "bg-background-elevated text-foreground"
            : "text-foreground-subtle hover:text-foreground-muted"
        )}
      >
        Monthly
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={period === "yearly"}
        onClick={() => onChange("yearly")}
        className={cn(
          "focus-ring press-feedback flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          period === "yearly"
            ? "bg-background-elevated text-foreground"
            : "text-foreground-subtle hover:text-foreground-muted"
        )}
      >
        Yearly
        {savingsLabel && (
          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
            Save {savingsLabel}
          </span>
        )}
      </button>
    </div>
  );
}
