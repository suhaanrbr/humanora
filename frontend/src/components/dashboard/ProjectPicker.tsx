"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface ProjectOption {
  id: string;
  name: string;
}

/**
 * Small "file under a project" menu — used from Library/Recent Work
 * items. Fetches the user's real project list lazily (only when opened,
 * so it never runs on every Library row on page load) and PATCHes
 * /api/projects/assign, which does the real ownership-checked write
 * (see lib/db/projects.ts#assignItemToProject) — this component only
 * renders state and reports success back to its caller.
 */
export function ProjectPicker({
  kind,
  itemId,
  currentProjectId,
  currentProjectName,
  onAssigned,
}: {
  kind: "humanized" | "study";
  itemId: string;
  currentProjectId: string | null;
  currentProjectName?: string | null;
  onAssigned: (projectId: string | null, projectName: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function handleOpen() {
    setOpen((v) => !v);
    if (projects !== null) return;
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(res.ok ? data.projects.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })) : []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  async function assign(projectId: string | null, projectName: string | null) {
    setSaving(true);
    try {
      const res = await fetch("/api/projects/assign", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id: itemId, projectId }),
      });
      if (res.ok) {
        onAssigned(projectId, projectName);
        setOpen(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={handleOpen}
        className="focus-ring press-feedback cursor-pointer text-xs text-foreground-subtle underline underline-offset-2 hover:text-foreground"
      >
        {currentProjectName ? `In ${currentProjectName}` : "Add to project"}
      </button>
      {open && (
        <div className="glass-panel absolute left-0 top-full z-20 mt-1.5 w-56 rounded-lg p-1.5 shadow-elevation-floating">
          {loading ? (
            <p className="px-2.5 py-2 text-xs text-foreground-subtle">Loading…</p>
          ) : !projects || projects.length === 0 ? (
            <p className="px-2.5 py-2 text-xs text-foreground-subtle">No projects yet.</p>
          ) : (
            <div className="flex flex-col">
              {currentProjectId && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => assign(null, null)}
                  className="focus-ring press-feedback cursor-pointer rounded-md px-2.5 py-1.5 text-left text-xs text-foreground-subtle hover:bg-white/[0.05] hover:text-foreground"
                >
                  Remove from project
                </button>
              )}
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={saving}
                  onClick={() => assign(p.id, p.name)}
                  className={cn(
                    "focus-ring press-feedback cursor-pointer truncate rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-white/[0.05]",
                    p.id === currentProjectId ? "text-brand-purple" : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
