"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { deriveTitle } from "@/lib/text";
import { formatDateTime } from "@/lib/formatDate";
import { cn } from "@/lib/cn";
import { BackToHome } from "@/components/dashboard/BackToHome";

// Must match HumanizeWorkspace.tsx / StudyWorkspace.tsx exactly — the
// "Humanize/Study into this project" shortcuts below write these, and
// the workspace reads them once on mount, files the new result under
// this project in the SAME request, then clears them.
const TARGET_PROJECT_ID_KEY = "humanora-target-project-id";
const TARGET_PROJECT_NAME_KEY = "humanora-target-project-name";

export interface ProjectDetailItem {
  kind: "humanized" | "study";
  id: string;
  mode: string;
  inputText: string;
  outputText: string;
  createdAt: string;
}

type FilterKind = "all" | "humanized" | "study";

/**
 * A Project's own focused workspace — not an admin CRUD list. Real
 * content only (items come from humanization/study_session rows
 * actually filed under this project id — see
 * lib/db/projects.ts#getProjectWithItems), inline rename/description
 * edit, in-project search/filter, and "start new work already filed
 * here" shortcuts into the real Humanize/Study workspaces.
 */
export function ProjectDetail({
  id,
  name: initialName,
  description: initialDescription,
  createdAt,
  items: initialItems,
}: {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  items: ProjectDetailItem[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(initialName);
  const [draftDescription, setDraftDescription] = useState(initialDescription ?? "");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKind>("all");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [removingKey, setRemovingKey] = useState<string | null>(null);

  const humanizedCount = items.filter((i) => i.kind === "humanized").length;
  const studyCount = items.length - humanizedCount;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byType = filter === "all" ? items : items.filter((i) => i.kind === filter);
    return q ? byType.filter((i) => i.inputText.toLowerCase().includes(q) || i.outputText.toLowerCase().includes(q)) : byType;
  }, [items, query, filter]);

  function startWork(destination: "humanize" | "study") {
    try {
      window.sessionStorage.setItem(TARGET_PROJECT_ID_KEY, id);
      window.sessionStorage.setItem(TARGET_PROJECT_NAME_KEY, name);
    } catch {
      // sessionStorage can throw in some private-browsing contexts —
      // navigate anyway, the result just won't auto-file.
    }
    router.push(destination === "humanize" ? "/dashboard/humanize" : "/dashboard/study");
  }

  async function saveEdit() {
    if (!draftName.trim() || savingEdit) return;
    setSavingEdit(true);
    setEditError("");
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draftName, description: draftDescription }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data?.error ?? "Couldn't save those changes.");
        return;
      }
      setName(draftName.trim());
      setDescription(draftDescription.trim() || null);
      setEditing(false);
    } catch {
      setEditError("Couldn't reach HUMANORA. Check your connection and try again.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function removeFromProject(item: ProjectDetailItem) {
    const key = `${item.kind}-${item.id}`;
    setRemovingKey(key);
    const previous = items;
    setItems((cur) => cur.filter((i) => `${i.kind}-${i.id}` !== key));
    try {
      const res = await fetch("/api/projects/assign", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: item.kind, id: item.id, projectId: null }),
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      setItems(previous);
    } finally {
      setRemovingKey(null);
    }
  }

  async function handleDeleteProject() {
    setDeletingProject(true);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/projects");
        router.refresh();
      }
    } finally {
      setDeletingProject(false);
    }
  }

  return (
    <div>
      <BackToHome />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        {editing ? (
          <div className="flex w-full max-w-lg flex-col gap-2.5">
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              maxLength={80}
              className="focus-ring h-10 rounded-md border border-border bg-surface px-3.5 text-lg font-bold text-foreground"
            />
            <textarea
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              placeholder="What's this project for? (optional)"
              maxLength={280}
              rows={2}
              className="focus-ring resize-none rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle"
            />
            {editError && <p className="text-xs text-danger">{editError}</p>}
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" loading={savingEdit} disabled={!draftName.trim()} onClick={saveEdit}>
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraftName(name);
                  setDraftDescription(description ?? "");
                  setEditError("");
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="focus-ring press-feedback group -ml-1 rounded-md px-1 text-left"
            >
              <h1 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-brand-purple">
                {name}
              </h1>
            </button>
            {description ? (
              <p className="mt-1 max-w-lg text-sm text-foreground-muted">{description}</p>
            ) : (
              <button type="button" onClick={() => setEditing(true)} className="focus-ring press-feedback mt-1 text-sm text-foreground-subtle underline underline-offset-2 hover:text-foreground">
                Add a description
              </button>
            )}
            <p className="mt-2 text-xs text-foreground-subtle">
              {items.length} item{items.length === 1 ? "" : "s"} · Created {formatDateTime(createdAt)}
            </p>
          </div>
        )}

        {!editing &&
          (confirmingDelete ? (
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs text-foreground-subtle">Delete this project?</span>
              <Button variant="destructive" size="sm" loading={deletingProject} onClick={handleDeleteProject}>
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(true)} className="shrink-0">
              Delete project
            </Button>
          ))}
      </div>

      {/* Start new work already filed here — the real "Document -> Humanize
          -> ... -> Project" connection, not a static card. */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => startWork("humanize")}>
          Humanize into this project
        </Button>
        <Button variant="secondary" size="sm" onClick={() => startWork("study")}>
          Study into this project
        </Button>
      </div>

      {items.length > 3 && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search within this project…"
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
        </div>
      )}

      {items.length === 0 ? (
        <Card className="glass-panel relative overflow-hidden p-10 text-center">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl"
            style={{ background: "var(--mesh-1)" }}
            aria-hidden="true"
          />
          <p className="relative text-sm font-medium text-foreground">Nothing filed here yet</p>
          <p className="relative mx-auto mt-1 max-w-sm text-sm text-foreground-muted">
            Start something new above, or file existing work from Library — deleting this project
            later never deletes that content, only un-files it.
          </p>
        </Card>
      ) : visible.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-foreground-muted">No results{query ? ` for "${query}"` : ""}.</p>
        </Card>
      ) : (
        <>
          {items.length > 3 && (
            <p className="mb-3 text-xs text-foreground-subtle">
              {humanizedCount} humanized, {studyCount} study session{studyCount === 1 ? "" : "s"}
            </p>
          )}
          <div className="flex flex-col gap-3">
            {visible.map((item) => {
              const key = `${item.kind}-${item.id}`;
              return (
                <Card key={key} className="p-5">
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs text-foreground-subtle">
                    <Badge variant={item.kind === "study" ? "brand" : "neutral"} className="capitalize">
                      {item.kind === "study" ? `Study · ${item.mode}` : item.mode}
                    </Badge>
                    <span>{formatDateTime(item.createdAt)}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{deriveTitle(item.inputText)}</p>
                  <p className="mt-1.5 line-clamp-2 text-sm text-foreground-muted">{item.outputText}</p>
                  <div className="mt-3 border-t border-border pt-3">
                    <button
                      type="button"
                      onClick={() => removeFromProject(item)}
                      disabled={removingKey === key}
                      className="focus-ring press-feedback cursor-pointer text-xs text-foreground-subtle underline underline-offset-2 hover:text-foreground disabled:opacity-50"
                    >
                      {removingKey === key ? "Removing…" : "Remove from project"}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
