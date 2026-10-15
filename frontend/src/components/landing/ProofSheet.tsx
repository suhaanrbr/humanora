"use client";

import { Fragment, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { writingModes } from "@/lib/config/modes";
import {
  PROOF_EXAMPLES,
  PROOF_ORIGINAL,
  cleanText,
  countWords,
  keptFigures,
  type NoteKind,
  type ProofExample,
} from "@/lib/config/proofExamples";
import { cn } from "@/lib/cn";

const ORIGINAL_WORDS = countWords(PROOF_ORIGINAL);
const NOTE_COLOR: Record<NoteKind, string> = {
  Cut: "text-brand-purple",
  Changed: "text-foreground",
  Kept: "text-brand-cyan",
};

/**
 * The hero's proof sheet: one AI-drafted paragraph, marked up the way
 * the chosen writing mode would edit it, then the clean copy. The Mode
 * control in the title bar switches between all six modes, mirroring
 * the Mode menu in the real Write workspace. Everything shown is derived
 * from lib/config/proofExamples.ts, so word counts and kept figures are
 * always computed, never typed in.
 */
export function ProofSheet() {
  const [mode, setMode] = useState<ProofExample["mode"]>("Professional");
  const example = PROOF_EXAMPLES.find((e) => e.mode === mode) ?? PROOF_EXAMPLES[0];
  const clean = cleanText(example.segments);

  return (
    <figure className="rounded-lg border border-border bg-background-elevated">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <DocumentIcon className="h-4 w-4 shrink-0 text-foreground-subtle" />
          <span className="truncate text-sm font-semibold text-foreground">Q3 update</span>
          <span className="shrink-0 text-sm text-foreground-subtle">Draft 1</span>
        </div>
        <ModeMenu value={mode} onChange={setMode} />
      </div>

      <div key={mode} className="animate-rise-in">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_9.5rem]">
          <p className="px-5 py-6 text-[1.0625rem] leading-[1.85] text-foreground-muted sm:px-6 sm:py-7">
            {example.segments.map(([kind, text], i) => {
              const next = example.segments[i + 1]?.[0];
              if (kind === "strike")
                return (
                  <span key={i} className={cn("mark-strike", next === "insert" && "mr-1.5")}>
                    {text}
                  </span>
                );
              if (kind === "insert")
                return (
                  <span key={i} className="mark-insert">
                    {text}
                  </span>
                );
              if (kind === "keep")
                return (
                  <span key={i} className="mark-keep text-foreground">
                    {text}
                  </span>
                );
              return <Fragment key={i}>{text}</Fragment>;
            })}
          </p>

          <ol className="flex flex-row flex-wrap gap-x-5 gap-y-2 border-t border-border px-5 py-4 text-[0.8125rem] leading-snug text-foreground-subtle sm:flex-col sm:gap-4 sm:border-l sm:border-t-0 sm:px-4 sm:py-7">
            {example.notes.map(([kind, note]) => (
              <li key={`${kind}-${note}`}>
                <span className={NOTE_COLOR[kind]}>{kind}.</span> {note}
              </li>
            ))}
          </ol>
        </div>

        <figcaption className="border-t border-border px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-app-label text-foreground-subtle">Clean copy</p>
          <p className="font-display mt-3 text-[1.375rem] leading-snug text-foreground">{clean}</p>
          <dl className="mt-5 grid grid-cols-2 divide-x divide-border border-t border-border pt-4 text-sm">
            <div className="pr-4">
              <dt className="text-foreground-subtle">Meaning check</dt>
              <dd className="mt-1 flex items-start gap-1.5 font-semibold text-success">
                <CheckIcon className="mt-[0.2em] h-3.5 w-3.5 shrink-0" />
                {keptFigures(example.segments)} of 3 figures kept
              </dd>
            </div>
            <div className="pl-4">
              <dt className="text-foreground-subtle">Length</dt>
              <dd className="mt-1 font-semibold text-foreground">
                <span className="tabular-nums">{ORIGINAL_WORDS}</span>
                <span className="mx-1.5 text-foreground-subtle" aria-label="to">
                  →
                </span>
                <span className="tabular-nums">{countWords(clean)}</span> words
              </dd>
            </div>
          </dl>
        </figcaption>
      </div>
    </figure>
  );
}

/**
 * "Mode · Professional ⌄" — a compact listbox matching the Mode menu in
 * the Write workspace. Opens below the title bar, right-aligned so it
 * stays on screen on phones; arrow keys move, Enter/Space choose,
 * Escape or an outside click closes.
 */
function ModeMenu({
  value,
  onChange,
}: {
  value: ProofExample["mode"];
  onChange: (mode: ProofExample["mode"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    listRef.current?.focus();
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  function openMenu() {
    setActive(Math.max(0, writingModes.findIndex((m) => m.name === value)));
    setOpen(true);
  }

  function choose(index: number) {
    onChange(writingModes[index].name as ProofExample["mode"]);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onListKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % writingModes.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + writingModes.length) % writingModes.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(writingModes.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      if (e.key === "Escape") buttonRef.current?.focus();
    }
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`Writing mode: ${value}. Change mode`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openMenu();
          }
        }}
        className={cn(
          "focus-ring inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs transition-colors",
          open
            ? "border-foreground/40 bg-surface-hover text-foreground"
            : "border-border-strong text-foreground-muted hover:border-foreground/40 hover:text-foreground"
        )}
      >
        <span className="hidden text-foreground-subtle sm:inline">Mode</span>
        <span className="font-semibold">{value}</span>
        <ChevronIcon className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label="Writing mode"
          aria-activedescendant={`${listId}-${active}`}
          onKeyDown={onListKeyDown}
          className="animate-nav-panel-fade-in absolute right-0 top-full z-20 mt-2 w-[min(17rem,calc(100vw-3rem))] overflow-hidden rounded-md border border-border-strong bg-background-elevated py-1 shadow-elevation-floating focus:outline-none"
        >
          {writingModes.map((m, i) => {
            const selected = m.name === value;
            return (
              <li
                key={m.name}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 px-3 py-2.5",
                  i === active && "bg-surface-hover"
                )}
              >
                <CheckIcon className={cn("mt-1 h-3.5 w-3.5 shrink-0 text-brand-purple", !selected && "invisible")} />
                <span className="min-w-0">
                  <span className={cn("block text-sm", selected ? "font-semibold text-foreground" : "text-foreground")}>
                    {m.name}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-foreground-subtle">{m.description}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6.5 3.5h7.5l4 4v12a1 1 0 0 1-1 1h-10.5a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M13.5 3.5V8h4.5M8.5 12.5h7M8.5 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m4 10.5 4 4 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
