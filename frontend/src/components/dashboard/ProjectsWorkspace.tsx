"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/formatDate";

export interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}

/**
 * Real Projects list + create form. A Project is a v1, honestly-scoped
 * grouping of a user's existing Humanize/Study output (see
 * lib/db/projects.ts) — not a fabricated "workspace" with chat/citation/
 * export tabs that don't exist yet. Deleting a project (via its detail
 * page) never deletes the content filed under it — only un-files it.
 */
export function ProjectsWorkspace({ initialProjects }: { initialProjects: ProjectRow[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Couldn't create that project.");
        return;
      }
      const now = new Date().toISOString();
      setProjects((prev) => [
        { id: data.id, name: name.trim(), description: description.trim() || null, createdAt: now, updatedAt: now, itemCount: 0 },
        ...prev,
      ]);
      setName("");
      setDescription("");
      setCreating(false);
    } catch {
      setError("Couldn't reach HUMANORA. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Group related Humanize and Study work together.
          </p>
        </div>
        {!creating && (
          <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
            New project
          </Button>
        )}
      </div>

      {creating && (
        <Card className="glass-panel mb-6 p-5">
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              maxLength={80}
              className="focus-ring h-10 rounded-md border border-border bg-surface px-3.5 text-sm text-foreground placeholder:text-foreground-subtle"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project for? (optional)"
              maxLength={280}
              rows={2}
              className="focus-ring resize-none rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle"
            />
            {error && <p className="text-xs text-danger">{error}</p>}
            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" size="sm" loading={saving} disabled={!name.trim()}>
                Create
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setCreating(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {projects.length === 0 && !creating ? (
        <Card className="glass-panel relative overflow-hidden p-10 text-center">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl"
            style={{ background: "var(--mesh-1)" }}
            aria-hidden="true"
          />
          <p className="relative text-base font-semibold text-foreground">No projects yet</p>
          <p className="relative mx-auto mt-1 max-w-sm text-sm text-foreground-muted">
            Projects group your Humanize and Study work by what it&apos;s actually for — a paper, a
            campaign, a course — instead of everything living in one flat list.
          </p>
          <Button variant="primary" size="sm" onClick={() => setCreating(true)} className="relative mt-5">
            Create your first project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/projects/${p.id}`}
              className="focus-ring hover-lift rounded-xl border border-border bg-surface p-5 transition-[border-color,box-shadow] hover:border-brand-purple/35 hover:shadow-glow-sm"
            >
              <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
              {p.description && <p className="mt-1 line-clamp-2 text-xs text-foreground-subtle">{p.description}</p>}
              <p className="mt-3 text-xs text-foreground-subtle">
                {p.itemCount} item{p.itemCount === 1 ? "" : "s"} · Updated {formatDate(p.updatedAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
