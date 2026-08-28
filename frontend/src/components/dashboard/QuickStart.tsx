"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Bridge keys — must match HumanizeWorkspace.tsx / StudyWorkspace.tsx
// exactly. This component does NOT call any AI endpoint itself: it
// hands the draft off to the real workspace (which already owns quota
// checks, mode/strength selection, My Voice application, meaning-check,
// etc.) rather than half-duplicating that UI here. That's the honest
// version of "quick humanize from Home" — a real shortcut into the real
// tool, not a second, thinner copy of it.
const HUMANIZE_DRAFT_KEY = "humanora-draft";
const STUDY_DRAFT_KEY = "humanora-study-draft";

export function QuickStart() {
  const router = useRouter();
  const [text, setText] = useState("");

  function send(destination: "humanize" | "study") {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      if (destination === "humanize") {
        window.sessionStorage.setItem(HUMANIZE_DRAFT_KEY, trimmed);
      } else {
        window.sessionStorage.setItem(STUDY_DRAFT_KEY, trimmed);
      }
    } catch {
      // sessionStorage can throw in some private-browsing contexts —
      // navigate anyway, the user can paste manually.
    }
    router.push(destination === "humanize" ? "/dashboard/humanize" : "/dashboard/study");
  }

  return (
    <div className="glass-panel rounded-2xl p-5">
      <p className="text-sm font-semibold text-foreground">Quick start</p>
      <p className="mt-0.5 text-xs text-foreground-subtle">
        Paste anything — pick where it goes.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste a draft or some study material…"
        rows={3}
        className="focus-ring mt-3 w-full resize-none rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => send("humanize")}
          disabled={!text.trim()}
          className="focus-ring press-feedback bg-brand-gradient cursor-pointer rounded-full px-4 py-2 text-xs font-semibold text-white shadow-glow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Humanize this →
        </button>
        <button
          type="button"
          onClick={() => send("study")}
          disabled={!text.trim()}
          className="focus-ring press-feedback cursor-pointer rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          Study this →
        </button>
      </div>
    </div>
  );
}
