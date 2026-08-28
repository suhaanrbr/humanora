"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { deriveTitle } from "@/lib/text";
import { formatDateTime } from "@/lib/formatDate";

export function RecentWorkCard({
  inputText,
  outputText,
  mode,
  strength,
  createdAt,
  kind = "humanized",
}: {
  inputText: string;
  outputText: string;
  mode: string;
  /** Study sessions have no rewrite "strength" — omit for those. */
  strength?: string;
  createdAt: string;
  /** Which real destination this row's title should link back to. */
  kind?: "humanized" | "study";
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard failures aren't worth an error state here
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-foreground-subtle">
        <Badge variant="neutral" className="capitalize">
          {mode}
        </Badge>
        <span>{formatDateTime(createdAt)}</span>
      </div>
      <Link
        href={kind === "study" ? "/dashboard/study" : "/dashboard/history"}
        className="focus-ring press-feedback -mx-1 block rounded-md px-1 py-0.5"
      >
        <p className="text-sm font-medium text-foreground hover:text-brand-purple">{deriveTitle(inputText)}</p>
        <p className="mt-1.5 line-clamp-2 text-sm text-foreground-muted">{outputText}</p>
      </Link>
      <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
        <button
          type="button"
          onClick={handleCopy}
          className="focus-ring press-feedback cursor-pointer text-xs text-foreground-subtle underline underline-offset-2 hover:text-foreground"
        >
          {copied ? "Copied" : "Copy result"}
        </button>
        {strength && <span className="text-xs text-foreground-subtle capitalize">{strength} strength</span>}
      </div>
    </Card>
  );
}
