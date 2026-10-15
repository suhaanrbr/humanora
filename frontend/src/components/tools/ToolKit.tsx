"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import type { ToolRunState } from "@/components/tools/useToolRun";
import { cn } from "@/lib/cn";

/**
 * Shared pieces for every tool page, so all of them share one layout:
 * a header, an input panel on the left, and a result panel on the right
 * (stacked on phones).
 */

export function ToolHeader({ name, summary, badge }: { name: string; summary: string; badge?: string }) {
  return (
    <div className="mb-8">
      <Link href="/dashboard/tools" className="focus-ring rounded-sm text-sm text-foreground-subtle hover:text-foreground">
        ← All tools
      </Link>
      <div className="mt-4 flex flex-wrap items-baseline gap-3">
        <h1 className="text-4xl leading-tight text-foreground">{name}</h1>
        {badge && <span className="eyebrow">{badge}</span>}
      </div>
      <p className="mt-2 max-w-2xl text-base text-foreground-muted">{summary}</p>
    </div>
  );
}

export function ToolColumns({ input, output }: { input: ReactNode; output: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
      <div>{input}</div>
      <div className="lg:sticky lg:top-6">{output}</div>
    </div>
  );
}

export function Panel({ title, actions, children, className }: { title: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-border bg-surface", className)}>
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-border px-5 py-2.5">
        <h2 className="text-app-label font-sans text-foreground-subtle">{title}</h2>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

export function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/** The input side: a large textarea, a word count, options, and the action. */
export function TextInputPanel({
  value,
  onChange,
  placeholder,
  maxChars,
  minChars,
  options,
  actionLabel,
  onRun,
  running,
  sample,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxChars: number;
  minChars: number;
  options?: ReactNode;
  actionLabel: string;
  onRun: () => void;
  running: boolean;
  sample?: string;
}) {
  const tooShort = value.trim().length < minChars;
  return (
    <Panel
      title="Your text"
      actions={
        <>
          {sample && !value && (
            <button type="button" onClick={() => onChange(sample)} className="focus-ring rounded-sm text-sm text-foreground-subtle hover:text-foreground">
              Try an example
            </button>
          )}
          {value && (
            <button type="button" onClick={() => onChange("")} className="focus-ring rounded-sm text-sm text-foreground-subtle hover:text-foreground">
              Clear
            </button>
          )}
        </>
      }
    >
      <label className="sr-only" htmlFor="tool-input">
        Your text
      </label>
      <textarea
        id="tool-input"
        value={value}
        maxLength={maxChars}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block min-h-[280px] w-full resize-y bg-transparent px-5 py-4 text-[1.0625rem] leading-relaxed text-foreground placeholder:text-foreground-subtle focus:outline-none"
      />
      {options && <div className="flex flex-col gap-4 border-t border-border px-5 py-4">{options}</div>}
      <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3.5">
        <span className="text-sm text-foreground-subtle">
          {wordCount(value).toLocaleString("en-IN")} words
          {value && tooShort && <span className="ml-2">· add a little more text</span>}
        </span>
        <Button onClick={onRun} loading={running} disabled={tooShort || running}>
          {running ? "Working…" : actionLabel}
        </Button>
      </div>
    </Panel>
  );
}

/** A labelled row of mutually exclusive choices (scrolls sideways on phones). */
export function Choice<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-24 shrink-0 text-sm text-foreground-subtle">{label}</span>
      <div role="radiogroup" aria-label={label} className="scrollbar-hide -mx-1 flex gap-1 overflow-x-auto px-1">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            onClick={() => onChange(o.value)}
            className={cn(
              "focus-ring shrink-0 rounded-md border px-3 py-1.5 text-sm transition-colors",
              o.value === value
                ? "border-foreground/40 bg-surface-hover font-semibold text-foreground"
                : "border-border text-foreground-muted hover:border-border-strong hover:text-foreground"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** The output side for every state except a finished result. */
export function ResultPlaceholder({ state, error, idleText, runningText }: { state: ToolRunState; error: string; idleText: string; runningText: string }) {
  if (state === "upgrade") return <UpgradeNotice />;
  return (
    <div className="px-5 py-10">
      {state === "running" ? (
        <div aria-live="polite">
          <p className="text-sm text-foreground-subtle">{runningText}</p>
          <div className="mt-5 flex flex-col gap-3" aria-hidden="true">
            {[92, 80, 86, 60].map((w) => (
              <span key={w} className="skeleton-line animate-sweep-shimmer block h-3" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      ) : state === "error" ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : (
        <p className="text-sm text-foreground-subtle">{idleText}</p>
      )}
    </div>
  );
}

export function UpgradeNotice() {
  return (
    <div className="px-5 py-8">
      <p className="font-display text-2xl text-foreground">This tool is part of every paid plan.</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-foreground-muted">
        Essential, Pro and Ultra include all AI Tools, drawing on the same monthly allowance as your rewrites.
        The Citation Generator stays free for everyone.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <ButtonLink href="/dashboard/billing" size="sm">
          See plans
        </ButtonLink>
        <ButtonLink href="/dashboard/tools/citation-generator" variant="secondary" size="sm">
          Open Citation Generator
        </ButtonLink>
      </div>
    </div>
  );
}

export function CopyButton({ text, label = "Copy", html }: { text: string; label?: string; html?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      if (html && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": new Blob([text], { type: "text/plain" }),
            "text/html": new Blob([html], { type: "text/html" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked (permissions or an insecure context): nothing to do.
    }
  }
  return (
    <button type="button" onClick={copy} className="focus-ring rounded-sm text-sm text-foreground-subtle hover:text-foreground">
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
