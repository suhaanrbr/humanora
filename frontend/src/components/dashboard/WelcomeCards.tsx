"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { changelog, formatChangelogDate } from "@/lib/config/changelog";
import { cn } from "@/lib/cn";

const DISMISS_KEY = "humanora-guide-dismissed";

export interface GuideStep {
  title: string;
  body: string;
  href: string;
  done: boolean;
}

// The dismissal lives in localStorage (see the cookie policy). Read via
// useSyncExternalStore so the server render and first client render
// agree (`null` = not known yet), then the real value takes over.
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("humanora-guide", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("humanora-guide", onChange);
  };
}
function readDismissed() {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}
function dismiss() {
  try {
    window.localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // Storage blocked: the guide simply comes back next visit.
  }
  window.dispatchEvent(new Event("humanora-guide"));
}

/**
 * Dashboard Home's opening row: a getting-started checklist driven by
 * the account's real progress (it disappears once everything is done, or
 * when dismissed), next to the three latest changelog entries.
 */
export function WelcomeCards({ steps }: { steps: GuideStep[] }) {
  const dismissed = useSyncExternalStore<boolean | null>(subscribe, readDismissed, () => null);
  const completed = steps.filter((s) => s.done).length;
  const showGuide = dismissed === false && completed < steps.length;
  const latest = changelog.slice(0, 3);

  return (
    <div className={cn("grid grid-cols-1 gap-4", showGuide && "lg:grid-cols-3")}>
      {showGuide && (
        <section aria-labelledby="guide-title" className="animate-rise-in rounded-lg border border-border bg-surface lg:col-span-2">
          <div className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <h2 id="guide-title" className="text-xl text-foreground">
                Getting started
              </h2>
              <p className="mt-0.5 text-sm text-foreground-subtle">
                {completed} of {steps.length} done
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="focus-ring rounded-sm text-sm text-foreground-subtle hover:text-foreground"
            >
              Hide
            </button>
          </div>
          <div className="h-0.5 bg-line" aria-hidden="true">
            <div className="h-full bg-brand-purple transition-[width] duration-500" style={{ width: `${(completed / steps.length) * 100}%` }} />
          </div>
          <ol className="divide-y divide-border">
            {steps.map((step, i) => (
              <li key={step.title}>
                <Link
                  href={step.href}
                  className="focus-ring group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-surface-hover"
                >
                  <span
                    className={cn(
                      "font-display mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm",
                      step.done ? "border-brand-purple bg-brand-purple text-white" : "border-border-strong text-foreground-subtle"
                    )}
                    aria-hidden="true"
                  >
                    {step.done ? "✓" : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-[0.9375rem] font-semibold", step.done ? "text-foreground-subtle line-through decoration-1" : "text-foreground")}>
                      {step.title}
                      <span className="sr-only">{step.done ? " (done)" : ""}</span>
                    </span>
                    <span className="mt-0.5 block text-sm text-foreground-subtle">{step.body}</span>
                  </span>
                  {!step.done && (
                    <span className="mt-1 text-sm text-foreground-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden="true">
                      →
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section
        aria-labelledby="whats-new-title"
        className={cn("animate-rise-in flex flex-col rounded-lg border border-border bg-surface", !showGuide && "lg:flex-row lg:items-stretch")}
      >
        <div className={cn("flex items-baseline justify-between border-b border-border px-5 py-4", !showGuide && "lg:w-56 lg:flex-col lg:justify-start lg:gap-2 lg:border-b-0 lg:border-r")}>
          <h2 id="whats-new-title" className="text-xl text-foreground">
            What&apos;s new
          </h2>
          <Link href="/changelog" className="focus-ring rounded-sm text-sm text-foreground-subtle hover:text-foreground">
            All updates →
          </Link>
        </div>
        <ul className={cn("flex-1 divide-y divide-border", !showGuide && "lg:grid lg:grid-cols-3 lg:divide-x lg:divide-y-0")}>
          {latest.map((entry) => (
            <li key={`${entry.date}-${entry.title}`} className="px-5 py-4">
              <p className="flex items-center gap-2 text-xs text-foreground-subtle">
                <span className={entry.tag === "New" ? "text-brand-purple" : undefined}>{entry.tag}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={entry.date}>{formatChangelogDate(entry.date)}</time>
              </p>
              <p className="mt-1 text-[0.9375rem] font-semibold text-foreground">{entry.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-foreground-subtle">{entry.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
