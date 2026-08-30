"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ProjectPicker } from "@/components/dashboard/ProjectPicker";
import { cn } from "@/lib/cn";
import { deriveTitle } from "@/lib/text";
import { formatDateTime } from "@/lib/formatDate";
import type { RecentWorkItem } from "@/lib/db/recentWork";

const DRAFT_STORAGE_KEY = "humanora-draft"; // must match HumanizeWorkspace.tsx
const STUDY_MODE_KEY = "humanora-study-mode"; // must match StudyWorkspace.tsx
const STUDY_DRAFT_KEY = "humanora-study-draft"; // must match StudyWorkspace.tsx

type SortOrder = "newest" | "oldest";
type FilterKind = "all" | "humanized" | "study";

/**
 * The Library workspace — HUMANORA's real memory of a user's work.
 * Unified across both content tables (humanization, study_session; see
 * lib/db/recentWork.ts) as of the Connected Workspace phase — Library
 * used to only show Humanize output even after Study sessions started
 * being persisted, which meant half a user's real saved work was
 * invisible here. Search, sort, filter by type, expand to see the
 * original, copy, reuse (loads the original back into the right
 * workspace), file under a project, and delete with confirmation — all
 * backed by real, ownership-scoped API calls; deletion is optimistic
 * but a failure restores the row.
 */
export function HistoryWorkspace({ initialEntries }: { initialEntries: RecentWorkItem[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [filter, setFilter] = useState<FilterKind>("all");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const humanizedCount = useMemo(() => entries.filter((e) => e.kind === "humanized").length, [entries]);
  const studyCount = entries.length - humanizedCount;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byType = filter === "all" ? entries : entries.filter((e) => e.kind === filter);
    const filtered = q
      ? byType.filter((e) => e.inputText.toLowerCase().includes(q) || e.outputText.toLowerCase().includes(q))
      : byType;
    const sorted = [...filtered].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sort === "newest" ? -diff : diff;
    });
    return sorted;
  }, [entries, query, sort, filter]);

  function keyOf(entry: RecentWorkItem) {
    return `${entry.kind}-${entry.id}`;
  }

  async function handleCopy(entry: RecentWorkItem) {
    try {
      await navigator.clipboard.writeText(entry.outputText);
      setCopiedKey(keyOf(entry));
      window.setTimeout(() => setCopiedKey((k) => (k === keyOf(entry) ? null : k)), 1600);
    } catch {
      // clipboard failures aren't worth an error state here
    }
  }

  async function handleDelete(entry: RecentWorkItem) {
    const previous = entries;
    setEntries((cur) => cur.filter((e) => keyOf(e) !== keyOf(entry)));
    setConfirmDeleteKey(null);
    try {
      const url = entry.kind === "humanized" ? `/api/history/${entry.id}` : `/api/study/${entry.id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
    } catch {
      setEntries(previous); // restore on failure
    }
  }

  function handleAssigned(entry: RecentWorkItem, projectId: string | null, projectName: string | null) {
    setEntries((cur) => cur.map((e) => (keyOf(e) === keyOf(entry) ? { ...e, projectId, projectName } : e)));
  }

  return (
    <div className="relative">
      {/* A restrained echo of LibraryScene's own indigo cinematic
          light, local to this page only. Purely decorative, no layout
          impact. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-6 -top-10 -z-10 h-[420px] overflow-hidden"
        style={{ background: "radial-gradient(55% 70% at 40% 0%, rgba(59,130,246,0.07) 0%, transparent 70%)" }}
      />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Library</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {entries.length === 0
              ? "Your humanized drafts and study sessions will appear here."
              : `${humanizedCount} humanized draft${humanizedCount === 1 ? "" : "s"}, ${studyCount} study session${studyCount === 1 ? "" : "s"}.`}
          </p>
        </div>
        {entries.length > 0 && (
          <ButtonLink href="/dashboard/humanize" variant="primary" size="sm">
            Humanize text
          </ButtonLink>
        )}
      </div>

      {entries.length > 3 && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your Library…"
            className="focus-ring h-10 min-w-[200px] flex-1 rounded-md border border-border bg-surface px-3.5 text-sm text-foreground placeholder:text-foreground-subtle"
          />
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1 text-xs">
            {(["all", "humanized", "study"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "focus-ring press-feedback cursor-pointer rounded-full px-3 py-1.5 font-medium capitalize transition-colors",
                  filter === f ? "bg-brand-gradient text-white" : "text-foreground-muted hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1 text-xs">
            {(["newest", "oldest"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={cn(
                  "focus-ring press-feedback cursor-pointer rounded-full px-3 py-1.5 font-medium capitalize transition-colors",
                  sort === s ? "bg-brand-gradient text-white" : "text-foreground-muted hover:text-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <Card className="glass-panel flex flex-col items-center gap-2 p-12 text-center">
          <LibraryIcon className="h-8 w-8 text-foreground-subtle" />
          <p className="mt-2 text-sm font-medium text-foreground">Your Library is empty</p>
          <p className="max-w-xs text-xs text-foreground-subtle">
            Every draft you humanize and every study session you run is saved here automatically —
            searchable, and ready to reuse.
          </p>
          <ButtonLink href="/dashboard/humanize" variant="secondary" size="sm" className="mt-3">
            Humanize your first draft
          </ButtonLink>
        </Card>
      ) : visible.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-foreground-muted">No results for &ldquo;{query}&rdquo;.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((entry) => (
            <LibraryCard
              key={keyOf(entry)}
              entry={entry}
              expanded={expandedKey === keyOf(entry)}
              onToggleExpand={() => setExpandedKey((k) => (k === keyOf(entry) ? null : keyOf(entry)))}
              confirmingDelete={confirmDeleteKey === keyOf(entry)}
              onRequestDelete={() => setConfirmDeleteKey(keyOf(entry))}
              onCancelDelete={() => setConfirmDeleteKey(null)}
              onConfirmDelete={() => handleDelete(entry)}
              onCopy={() => handleCopy(entry)}
              copied={copiedKey === keyOf(entry)}
              onAssigned={(projectId, projectName) => handleAssigned(entry, projectId, projectName)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LibraryCard({
  entry,
  expanded,
  onToggleExpand,
  confirmingDelete,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  onCopy,
  copied,
  onAssigned,
}: {
  entry: RecentWorkItem;
  expanded: boolean;
  onToggleExpand: () => void;
  confirmingDelete: boolean;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onCopy: () => void;
  copied: boolean;
  onAssigned: (projectId: string | null, projectName: string | null) => void;
}) {
  const router = useRouter();

  function handleReuse() {
    try {
      if (entry.kind === "humanized") {
        window.sessionStorage.setItem(DRAFT_STORAGE_KEY, entry.inputText);
        router.push("/dashboard/humanize");
      } else {
        window.sessionStorage.setItem(STUDY_DRAFT_KEY, entry.inputText);
        window.sessionStorage.setItem(STUDY_MODE_KEY, entry.mode);
        router.push("/dashboard/study");
      }
    } catch {
      // sessionStorage can throw in some private-browsing contexts —
      // the user can still paste manually, not worth blocking on.
      router.push(entry.kind === "humanized" ? "/dashboard/humanize" : "/dashboard/study");
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-foreground-subtle">
        <div className="flex items-center gap-2 capitalize">
          <Badge variant={entry.kind === "study" ? "brand" : "neutral"} className="capitalize">
            {entry.kind === "study" ? `Study · ${entry.mode}` : entry.mode}
          </Badge>
          {entry.kind === "humanized" && <span>{entry.strength}</span>}
        </div>
        <span>{formatDateTime(entry.createdAt)}</span>
      </div>

      <button
        type="button"
        onClick={onToggleExpand}
        className="focus-ring press-feedback -mx-1 block w-full cursor-pointer rounded-md px-1 py-0.5 text-left"
      >
        <p className="text-sm font-medium text-foreground">{deriveTitle(entry.inputText)}</p>
        <p className={cn("mt-1.5 text-sm text-foreground-muted", !expanded && "line-clamp-2")}>{entry.outputText}</p>
      </button>

      {expanded && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-foreground-subtle">Original</p>
          <p className="whitespace-pre-wrap text-sm text-foreground-muted">{entry.inputText}</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onCopy}
            className="focus-ring press-feedback cursor-pointer text-xs text-foreground-subtle underline underline-offset-2 hover:text-foreground"
          >
            {copied ? "Copied" : "Copy result"}
          </button>
          <button
            type="button"
            onClick={handleReuse}
            className="focus-ring press-feedback cursor-pointer text-xs text-foreground-subtle underline underline-offset-2 hover:text-foreground"
          >
            Reuse this draft
          </button>
          <ProjectPicker
            kind={entry.kind}
            itemId={entry.id}
            currentProjectId={entry.projectId}
            currentProjectName={entry.projectName}
            onAssigned={onAssigned}
          />
          <span className="text-xs text-foreground-subtle">{entry.wordCount} words</span>
        </div>

        {confirmingDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground-subtle">Delete permanently?</span>
            <Button variant="destructive" size="sm" onClick={onConfirmDelete}>
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={onCancelDelete}>
              Cancel
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onRequestDelete}
            className="focus-ring press-feedback cursor-pointer text-xs text-foreground-subtle underline underline-offset-2 hover:text-danger"
          >
            Delete
          </button>
        )}
      </div>
    </Card>
  );
}

function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3.5 12a8.5 8.5 0 1 0 2.7-6.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.5 4.5V9h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8v4.5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
