"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { deriveTitle } from "@/lib/text";
import { formatDateTime } from "@/lib/formatDate";

export interface ProjectDetailItem {
  kind: "humanized" | "study";
  id: string;
  mode: string;
  inputText: string;
  outputText: string;
  createdAt: string;
}

export function ProjectDetail({
  id,
  name,
  description,
  items,
}: {
  id: string;
  name: string;
  description: string | null;
  items: ProjectDetailItem[];
}) {
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/projects");
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{name}</h1>
          {description && <p className="mt-1 max-w-lg text-sm text-foreground-muted">{description}</p>}
          <p className="mt-2 text-xs text-foreground-subtle">
            {items.length} item{items.length === 1 ? "" : "s"}
          </p>
        </div>
        {confirmingDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground-subtle">Delete this project?</span>
            <Button variant="destructive" size="sm" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(true)}>
            Delete project
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="glass-panel p-10 text-center">
          <p className="text-sm font-medium text-foreground">Nothing filed here yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-foreground-muted">
            Add existing Humanize or Study work to this project from Library or Recent Work — deleting
            this project later never deletes that content, only un-files it.
          </p>
          <ButtonLink href="/dashboard/history" variant="secondary" size="sm" className="mt-4">
            Open Library
          </ButtonLink>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Card key={`${item.kind}-${item.id}`} className="p-5">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs text-foreground-subtle">
                <Badge variant="neutral" className="capitalize">
                  {item.kind === "humanized" ? item.mode : `Study · ${item.mode}`}
                </Badge>
                <span>{formatDateTime(item.createdAt)}</span>
              </div>
              <p className="text-sm font-medium text-foreground">{deriveTitle(item.inputText)}</p>
              <p className="mt-1.5 line-clamp-2 text-sm text-foreground-muted">{item.outputText}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
