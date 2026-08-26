"use client";

import { useState } from "react";
import { comparisonCategories, planColumnNames } from "@/lib/config/pricing";
import { cn } from "@/lib/cn";

/**
 * Full plan comparison. Desktop/tablet gets a scrollable table; mobile
 * gets a per-plan accordion instead of a squeezed table, since a 5-column
 * table simply doesn't fit a phone screen usefully.
 */
export function PlanComparison() {
  return (
    <div>
      {/* Table — sm and up */}
      <div className="hidden overflow-x-auto rounded-xl border border-border sm:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-background-elevated">
              <th scope="col" className="px-5 py-4 font-medium text-foreground-subtle">
                Plan
              </th>
              {planColumnNames.map((name) => (
                <th key={name} scope="col" className="px-5 py-4 text-center font-semibold text-foreground">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonCategories.map((category) => (
              <CategoryRows key={category.title} title={category.title} rows={category.rows} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-plan accordion — mobile only */}
      <div className="flex flex-col gap-3 sm:hidden">
        {planColumnNames.map((name, planIndex) => (
          <MobilePlanPanel key={name} name={name} planIndex={planIndex} />
        ))}
      </div>
    </div>
  );
}

function CategoryRows({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; values: [string, string, string, string] }[];
}) {
  return (
    <>
      <tr>
        <td colSpan={5} className="bg-background-elevated px-5 py-2 text-xs font-semibold uppercase tracking-wide text-foreground-subtle">
          {title}
        </td>
      </tr>
      {rows.map((row) => (
        <tr key={row.label} className="border-b border-border last:border-b-0">
          <td className="px-5 py-3 text-foreground-muted">{row.label}</td>
          {row.values.map((value, i) => (
            <td key={i} className="px-5 py-3 text-center text-foreground">
              <ValueCell value={value} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function MobilePlanPanel({ name, planIndex }: { name: string; planIndex: number }) {
  const [open, setOpen] = useState(planIndex === 2); // Pro open by default

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="focus-ring flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-foreground">{name}</span>
        <ChevronIcon className={cn("h-4 w-4 text-foreground-subtle transition-transform", open && "rotate-180")} />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-4 border-t border-border px-4 py-4">
            {comparisonCategories.map((category) => (
              <div key={category.title}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-subtle">
                  {category.title}
                </p>
                <div className="flex flex-col gap-1.5">
                  {category.rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-foreground-muted">{row.label}</span>
                      <span className="font-medium text-foreground">
                        <ValueCell value={row.values[planIndex]} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ValueCell({ value }: { value: string }) {
  if (value === "✓") {
    return (
      <span title="Included">
        <CheckIcon className="mx-auto h-4 w-4 text-success" />
      </span>
    );
  }
  if (value === "—") {
    return (
      <span className="text-foreground-subtle" aria-label="Not included">
        —
      </span>
    );
  }
  return <>{value}</>;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
