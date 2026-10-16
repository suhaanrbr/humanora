"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Bump the suffix when the announcement changes, so readers who
// dismissed the last one still see the new one.
const DISMISS_KEY = "humanora-announcement-dismissed:tools-v1";

/**
 * A one-line "what's new" strip above the site header, pointing at the
 * newest shipped work. Dismissible; the choice is remembered in this
 * browser only.
 */
export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect --
     localStorage is browser-only, so reading it during render would
     cause a hydration mismatch. Same pattern as the auth email bridge. */
  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY)) setDismissed(true);
    } catch {
      // storage can be blocked — the bar just shows
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore — dismissing for this visit is enough
    }
  }

  return (
    <div className="relative border-b border-border bg-surface-warm text-surface-warm-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-12 py-2.5 text-sm">
        <span className="hidden shrink-0 rounded-sm bg-brand-indigo px-1.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white sm:inline">
          New
        </span>
        <p className="text-balance text-center leading-snug">
          <span className="xl:hidden">Six new AI tools are here. </span>
          <span className="hidden xl:inline">
            Grammar Checker, Paraphraser, Summarizer, Quiz Generator, Fact Checker and Citation Generator are now in Humanora.{" "}
          </span>
          <Link href="/tools" className="focus-ring rounded-sm font-semibold underline underline-offset-4">
            See the toolkit&nbsp;→
          </Link>
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="focus-ring absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-sm opacity-70 transition-opacity hover:opacity-100"
      >
        <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
          <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
