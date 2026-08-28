"use client";

import { useState } from "react";
import { RecentWorkCard } from "@/components/dashboard/RecentWorkCard";
import { cn } from "@/lib/cn";
import type { RecentWorkItem } from "@/lib/db/recentWork";

// "Documents"/"Voice"/"Projects" are real destinations in the mockup's
// tab row but have no backing content table yet (Documents/Projects
// don't exist as their own concept — see schema.ts; Voice profiles
// aren't "work items" the same way a humanization or study session is).
// They're shown, disabled, rather than omitted, so the tab row's shape
// matches where this is headed without pretending they're populated
// today.
type TabKey = "all" | "humanized" | "study" | "documents" | "voice" | "projects";

const TABS: { key: TabKey; label: string; disabled?: boolean }[] = [
  { key: "all", label: "All" },
  { key: "humanized", label: "Humanized" },
  { key: "study", label: "Study" },
  { key: "documents", label: "Documents", disabled: true },
  { key: "voice", label: "Voice", disabled: true },
  { key: "projects", label: "Projects", disabled: true },
];

export function RecentWorkTabs({ items }: { items: RecentWorkItem[] }) {
  const [tab, setTab] = useState<TabKey>("all");

  const visible = items.filter((item) => tab === "all" || item.kind === tab);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            disabled={t.disabled}
            onClick={() => setTab(t.key)}
            className={cn(
              "focus-ring press-feedback rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              t.disabled
                ? "cursor-not-allowed border-border text-foreground-subtle/60"
                : tab === t.key
                  ? "border-brand-purple/40 bg-surface text-foreground"
                  : "cursor-pointer border-border text-foreground-muted hover:bg-surface hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-foreground-subtle">Nothing here yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((item) => (
            <RecentWorkCard
              key={`${item.kind}-${item.id}`}
              inputText={item.inputText}
              outputText={item.outputText}
              mode={item.mode}
              strength={item.kind === "humanized" ? item.strength : undefined}
              createdAt={item.createdAt}
              kind={item.kind}
            />
          ))}
        </div>
      )}
    </div>
  );
}
