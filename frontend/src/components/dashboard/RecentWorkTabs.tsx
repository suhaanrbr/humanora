"use client";

import { useState } from "react";
import { RecentWorkCard } from "@/components/dashboard/RecentWorkCard";
import { cn } from "@/lib/cn";
import type { RecentWorkItem } from "@/lib/db/recentWork";

// "Documents"/"Voice" don't exist as their own concept — Documents isn't
// a distinct table from Humanize/Study output (see schema.ts), and Voice
// profiles aren't "work items" the same way a humanization or study
// session is. Shown, disabled, so the tab row's shape matches where
// this is headed without pretending they're populated today. "Projects"
// is now real (Connected Workspace phase) — filters to items that have
// actually been filed under a project.
type TabKey = "all" | "humanized" | "study" | "documents" | "voice" | "projects";

const TABS: { key: TabKey; label: string; disabled?: boolean }[] = [
  { key: "all", label: "All" },
  { key: "humanized", label: "Humanized" },
  { key: "study", label: "Study" },
  { key: "projects", label: "Projects" },
  { key: "documents", label: "Documents", disabled: true },
  { key: "voice", label: "Voice", disabled: true },
];

export function RecentWorkTabs({ items }: { items: RecentWorkItem[] }) {
  const [tab, setTab] = useState<TabKey>("all");

  const visible = items.filter((item) => {
    if (tab === "all") return true;
    if (tab === "projects") return item.projectId !== null;
    return item.kind === tab;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-fit flex-wrap gap-1 rounded-full border border-border bg-surface/60 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            disabled={t.disabled}
            onClick={() => setTab(t.key)}
            className={cn(
              "focus-ring press-feedback rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
              t.disabled
                ? "cursor-not-allowed text-foreground-subtle/50"
                : tab === t.key
                  ? "bg-brand-gradient cursor-default text-white shadow-glow-sm"
                  : "cursor-pointer text-foreground-muted hover:bg-white/[0.05] hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-foreground-subtle">
          {tab === "projects" ? "Nothing filed under a project yet." : "Nothing here yet."}
        </p>
      ) : (
        <div className="flex animate-stagger-in flex-col gap-3">
          {visible.map((item) => (
            <RecentWorkCard
              key={`${item.kind}-${item.id}`}
              id={item.id}
              inputText={item.inputText}
              outputText={item.outputText}
              mode={item.mode}
              strength={item.kind === "humanized" ? item.strength : undefined}
              createdAt={item.createdAt}
              kind={item.kind}
              projectId={item.projectId}
              projectName={item.projectName}
              showProjectPicker
            />
          ))}
        </div>
      )}
    </div>
  );
}
