"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

const STUDY_MODE_KEY = "humanora-study-mode";

interface CommandItem {
  id: string;
  label: string;
  hint: string;
  group: "Go to" | "Quick actions";
  run: (router: ReturnType<typeof useRouter>) => void;
}

const ITEMS: CommandItem[] = [
  { id: "nav-home", label: "Home", hint: "Go to Home", group: "Go to", run: (r) => r.push("/dashboard") },
  { id: "nav-write", label: "Write", hint: "Go to Write", group: "Go to", run: (r) => r.push("/dashboard/humanize") },
  { id: "nav-study", label: "Study", hint: "Go to Study", group: "Go to", run: (r) => r.push("/dashboard/study") },
  { id: "nav-voice", label: "My Voice", hint: "Go to My Voice", group: "Go to", run: (r) => r.push("/dashboard/voice") },
  { id: "nav-library", label: "Library", hint: "Go to Library", group: "Go to", run: (r) => r.push("/dashboard/history") },
  { id: "nav-billing", label: "Billing", hint: "Go to Billing", group: "Go to", run: (r) => r.push("/dashboard/billing") },
  { id: "nav-settings", label: "Settings", hint: "Go to Settings", group: "Go to", run: (r) => r.push("/dashboard/settings") },
  {
    id: "action-humanize",
    label: "Humanize a draft",
    hint: "Opens Write",
    group: "Quick actions",
    run: (r) => r.push("/dashboard/humanize"),
  },
  {
    id: "action-summarize",
    label: "Summarize something",
    hint: "Opens Study",
    group: "Quick actions",
    run: (r) => {
      try {
        window.sessionStorage.setItem(STUDY_MODE_KEY, "summarize");
      } catch {}
      r.push("/dashboard/study?mode=summarize");
    },
  },
  {
    id: "action-explain",
    label: "Explain something",
    hint: "Opens Study",
    group: "Quick actions",
    run: (r) => {
      try {
        window.sessionStorage.setItem(STUDY_MODE_KEY, "explain");
      } catch {}
      r.push("/dashboard/study?mode=explain");
    },
  },
  {
    id: "action-notes",
    label: "Make study notes",
    hint: "Opens Study",
    group: "Quick actions",
    run: (r) => {
      try {
        window.sessionStorage.setItem(STUDY_MODE_KEY, "notes");
      } catch {}
      r.push("/dashboard/study?mode=notes");
    },
  },
];

/**
 * The command palette's trigger button — one of these renders in the
 * desktop rail, a different one in the mobile header, but both just
 * call `onOpen`. The actual overlay/keydown-listener/state lives once
 * in `CommandPalette` below (mounted once, by AppShell) — mounting the
 * full palette in two responsive slots would double the global Cmd+K
 * listener and stack two competing full-screen overlays, which is
 * exactly what an earlier draft of this did before this got noticed
 * and split apart.
 */
export function CommandTrigger({ onOpen, className }: { onOpen: () => void; className?: string }) {
  const isMac = typeof navigator !== "undefined" && navigator.platform?.toLowerCase().includes("mac");
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "focus-ring press-feedback flex h-9 w-full cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-sm text-foreground-subtle transition-colors hover:border-border-interactive hover:text-foreground-muted",
        className
      )}
    >
      <SearchIcon className="h-4 w-4 shrink-0" />
      <span className="truncate">Search or jump to…</span>
      <kbd className="ml-auto hidden shrink-0 rounded border border-border-strong bg-background-elevated px-1.5 py-0.5 text-[10px] font-medium text-foreground-subtle sm:block">
        {isMac ? "⌘K" : "Ctrl K"}
      </kbd>
    </button>
  );
}

/**
 * HUMANORA's command palette overlay — mount exactly ONCE per app
 * (AppShell owns this). Ctrl/Cmd+K toggles it globally regardless of
 * which trigger button is visible at the current viewport. Scoped to
 * what's real today: navigating to an existing page, or jumping into
 * Write/Study with a mode pre-selected. Deliberately does NOT include
 * "search Library" — that needs a real unified Write+Study data model
 * (Stage 6's job, not invented here), and a fake/empty search box
 * would be worse than no search box. No AI call happens anywhere in
 * this component.
 */
export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const filtered = ITEMS.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        triggerRef.current = document.activeElement as HTMLElement;
        onOpenChange(!open);
      } else if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* eslint-disable react-hooks/set-state-in-effect --
     Deliberate: resetting the palette's local search state when it
     transitions from closed to open (and returning focus to whatever
     triggered it on close) is synchronizing this component with an
     external event — a global keyboard shortcut or a click far outside
     this component's own render tree — not state derivable from props
     during render. Same accepted pattern as the sessionStorage-restore
     effects elsewhere in this codebase (e.g. HumanizeWorkspace). */
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      const id = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(id);
    }
    triggerRef.current?.focus();
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function activate(item: CommandItem) {
    onOpenChange(false);
    item.run(router);
  }

  function onKeyDownList(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) activate(item);
    }
  }

  if (!open) return null;

  let renderIndex = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[15vh] backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="surface-modal w-full max-w-lg rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
          <SearchIcon className="h-4 w-4 shrink-0 text-foreground-subtle" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDownList}
            placeholder="Search or jump to…"
            aria-label="Command input"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none"
          />
          <kbd className="shrink-0 rounded border border-border-strong px-1.5 py-0.5 text-[10px] text-foreground-subtle">Esc</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2" role="listbox">
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-foreground-subtle">No matches for &ldquo;{query}&rdquo;.</p>
          )}
          {(["Go to", "Quick actions"] as const).map((group) => {
            const groupItems = filtered.filter((i) => i.group === group);
            if (groupItems.length === 0) return null;
            return (
              <div key={group} className="mb-1 last:mb-0">
                <p className="px-3 py-1.5 text-app-label text-foreground-subtle">{group}</p>
                {groupItems.map((item) => {
                  renderIndex += 1;
                  const isActive = renderIndex === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActiveIndex(filtered.indexOf(item))}
                      onClick={() => activate(item)}
                      className={cn(
                        "focus-ring press-feedback flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                        isActive ? "bg-surface-hover text-foreground" : "text-foreground-muted"
                      )}
                    >
                      <span>{item.label}</span>
                      <span className="text-xs text-foreground-subtle">{item.hint}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
