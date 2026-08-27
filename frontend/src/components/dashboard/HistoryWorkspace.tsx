"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/cn";
import { deriveTitle } from "@/lib/text";
import { formatDateTime } from "@/lib/formatDate";

const DRAFT_STORAGE_KEY = "humanora-draft"; // must match HumanizeWorkspace.tsx

export interface HistoryEntry {
  id: string;
  mode: string;
  strength: string;
  inputText: string;
  outputText: string;
  wordCount: number;
  createdAt: string; // ISO — serialized from the server component
}

type SortOrder = "newest" | "oldest";

/**
 * The real History workspace: search across saved work, sort, expand
 * an entry to see both the original and the result, copy, reuse (loads
 * the original back into the Humanize workspace), and delete with
 * confirmation. All data here is what the server actually sent —
 * deletion is optimistic (removed from view immediately) but backed by
 * a real, ownership-scoped API call; a failure restores the row.
 */
export function HistoryWorkspace({ initialEntries }: { initialEntries: HistoryEntry[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? entries.filter(
          (e) => e.inputText.toLowerCase().includes(q) || e.outputText.toLowerCase().includes(q)
        )
      : entries;
    const sorted = [...filtered].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sort === "newest" ? -diff : diff;
    });
    return sorted;
  }, [entries, query, sort]);

  async function handleCopy(entry: HistoryEntry) {
    try {
      await navigator.clipboard.writeText(entry.outputText);
      setCopiedId(entry.id);
      window.setTimeout(() => setCopiedId((id) => (id === entry.id ? null : id)), 1600);
    } catch {
      // clipboard failures aren't worth an error state here
    }
  }

  async function handleDelete(entry: HistoryEntry) {
    const previous = entries;
    setEntries((cur) => cur.filter((e) => e.id !== entry.id));
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/history/${entry.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
    } catch {
      setEntries(previous); // restore on failure
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">History</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {entries.length === 0
              ? "Your humanized work will appear here."
              : `${entries.length} saved humanization${entries.length === 1 ? "" : "s"}.`}
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
            placeholder="Search your history…"
            className="focus-ring h-10 flex-1 rounded-md border border-border bg-surface px-3.5 text-sm text-foreground placeholder:text-foreground-subtle"
          />
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
        <Card className="p-8 text-center">
          <p className="text-sm text-foreground-muted">No writing history yet.</p>
          <p className="mt-1 text-xs text-foreground-subtle">
            Your recent HUMANORA transformations will appear here.
          </p>
          <div className="mt-4 flex justify-center">
            <ButtonLink href="/dashboard/humanize" variant="secondary" size="sm">
              Humanize your first draft
            </ButtonLink>
          </div>
        </Card>
      ) : visible.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-foreground-muted">No results for &ldquo;{query}&rdquo;.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((entry) => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              expanded={expandedId === entry.id}
              onToggleExpand={() => setExpandedId((id) => (id === entry.id ? null : entry.id))}
              confirmingDelete={confirmDeleteId === entry.id}
              onRequestDelete={() => setConfirmDeleteId(entry.id)}
              onCancelDelete={() => setConfirmDeleteId(null)}
              onConfirmDelete={() => handleDelete(entry)}
              onCopy={() => handleCopy(entry)}
              copied={copiedId === entry.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryCard({
  entry,
  expanded,
  onToggleExpand,
  confirmingDelete,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  onCopy,
  copied,
}: {
  entry: HistoryEntry;
  expanded: boolean;
  onToggleExpand: () => void;
  confirmingDelete: boolean;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  const router = useRouter();

  function handleReuse() {
    try {
      window.sessionStorage.setItem(DRAFT_STORAGE_KEY, entry.inputText);
    } catch {
      // sessionStorage can throw in some private-browsing contexts —
      // the user can still paste manually, not worth blocking on.
    }
    router.push("/dashboard/humanize");
  }

  return (
    <Card className="p-5">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-foreground-subtle">
        <div className="flex items-center gap-2 capitalize">
          <Badge variant="neutral" className="capitalize">
            {entry.mode}
          </Badge>
          <span>{entry.strength}</span>
        </div>
        <span>{formatDateTime(entry.createdAt)}</span>
      </div>

      <button
        type="button"
        onClick={onToggleExpand}
        className="focus-ring press-feedback -mx-1 block w-full cursor-pointer rounded-md px-1 py-0.5 text-left"
      >
        <p className="text-sm font-medium text-foreground">{deriveTitle(entry.inputText)}</p>
        <p className={cn("mt-1.5 text-sm text-foreground-muted", !expanded && "line-clamp-2")}>
          {entry.outputText}
        </p>
      </button>

      {expanded && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-foreground-subtle">Original</p>
          <p className="whitespace-pre-wrap text-sm text-foreground-muted">{entry.inputText}</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <div className="flex items-center gap-4">
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
