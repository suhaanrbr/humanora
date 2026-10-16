"use client";

import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { analyzeTells, TELL_LABELS, type TellKind, type TellsReport } from "@/lib/tells";
import { TELLS_SAMPLES } from "@/lib/config/tellsSamples";
import { cn } from "@/lib/cn";

const SAMPLE = TELLS_SAMPLES[0].text;

const KINDS: TellKind[] = ["filler", "inflated", "hedge", "triplet"];
const MAX_CHARS = 5000;

/**
 * The homepage's hands-on moment. Paste anything and see, as you type,
 * what an editor would mark. Runs entirely in the browser (lib/tells.ts);
 * the closing CTA hands off to the real, account-backed rewrite.
 */
export function TellsLab() {
  const [text, setText] = useState(SAMPLE);
  const deferred = useDeferredValue(text);
  const report = useMemo(() => analyzeTells(deferred), [deferred]);
  const total = report.matches.length;

  return (
    <div className="rounded-lg border border-border bg-background-elevated">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col border-b border-border lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-border px-5 py-3 text-sm text-foreground-subtle">
            <label htmlFor="tells-input">Your text</label>
            {text && (
              <button type="button" onClick={() => setText("")} className="focus-ring rounded-sm hover:text-foreground">
                Clear
              </button>
            )}
          </div>
          {/* One-click samples, so nobody has to go find a draft first.
              The last one is human-written: the checker staying quiet on
              it is the point. */}
          <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto border-b border-border px-5 py-2.5">
            <span className="shrink-0 text-sm text-foreground-subtle">Try:</span>
            {TELLS_SAMPLES.map((sample) => {
              const active = text === sample.text;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => setText(sample.text)}
                  aria-pressed={active}
                  className={cn(
                    "focus-ring inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[0.8125rem] transition-colors",
                    active
                      ? "border-brand-purple/50 bg-brand-purple/10 text-foreground"
                      : "border-border text-foreground-muted hover:border-border-strong hover:text-foreground"
                  )}
                >
                  {sample.human && <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />}
                  {sample.label}
                </button>
              );
            })}
          </div>
          <textarea
            id="tells-input"
            value={text}
            maxLength={MAX_CHARS}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a paragraph from any AI-assisted draft…"
            spellCheck={false}
            className="min-h-[260px] w-full flex-1 resize-y bg-transparent px-5 py-4 text-[1.0625rem] leading-relaxed text-foreground placeholder:text-foreground-subtle focus:outline-none"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-border px-5 py-3 text-sm text-foreground-subtle">
            <span>What an editor would mark</span>
            <span aria-live="polite">
              {report.words === 0 ? "—" : `${total} ${total === 1 ? "mark" : "marks"} in ${report.words} words`}
            </span>
          </div>
          <div className="min-h-[260px] flex-1 whitespace-pre-wrap px-5 py-4 text-[1.0625rem] leading-[1.9] text-foreground-muted">
            {report.words === 0 ? (
              <span className="text-foreground-subtle">Marks will appear here as you type.</span>
            ) : total === 0 && report.words >= 20 ? (
              <>
                <Highlighted text={deferred} report={report} />
                <span className="mt-4 flex items-center gap-2 text-sm text-success">
                  <span aria-hidden="true">✓</span> Nothing an editor would mark here. This reads like a person wrote it.
                </span>
              </>
            ) : (
              <Highlighted text={deferred} report={report} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 border-t border-border px-5 py-5 md:grid-cols-[1fr_auto] md:items-end">
        <div className="flex flex-col gap-4">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {KINDS.map((kind) => (
              <li key={kind} className="flex items-center gap-2 text-foreground-muted" title={TELL_LABELS[kind].hint}>
                <span className={cn("h-2.5 w-2.5 rounded-full", `tell-swatch-${kind}`)} aria-hidden="true" />
                {TELL_LABELS[kind].name}
                <span className="tabular-nums text-foreground">{report.counts[kind]}</span>
              </li>
            ))}
          </ul>
          <Rhythm lengths={report.sentenceLengths} uniform={report.uniformRhythm} />
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <ButtonLink href="/signup" variant="primary" size="md">
            Fix these with Humanora
          </ButtonLink>
          <p className="text-xs text-foreground-subtle">Runs in your browser. Nothing you paste is sent anywhere.</p>
        </div>
      </div>
    </div>
  );
}

function Highlighted({ text, report }: { text: string; report: TellsReport }) {
  const parts: ReactNode[] = [];
  let cursor = 0;
  report.matches.forEach((m, i) => {
    if (m.start > cursor) parts.push(text.slice(cursor, m.start));
    parts.push(
      <mark key={i} className={cn("tell", `tell-${m.kind}`)} title={TELL_LABELS[m.kind].name}>
        {text.slice(m.start, m.end)}
      </mark>
    );
    cursor = m.end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

/** Sentence lengths as a row of bars: a flat skyline is the tell. */
function Rhythm({ lengths, uniform }: { lengths: number[]; uniform: boolean }) {
  if (lengths.length < 2) return null;
  const max = Math.max(...lengths);
  const shown = lengths.slice(0, 40);
  return (
    <div className="flex items-end gap-4">
      <div className="flex h-8 items-end gap-[3px]" aria-hidden="true">
        {shown.map((len, i) => (
          <span
            key={i}
            className={cn("w-1.5 rounded-[1px]", uniform ? "bg-brand-purple" : "bg-foreground-subtle")}
            style={{ height: `${Math.max(12, (len / max) * 100)}%` }}
          />
        ))}
      </div>
      <p className="text-sm text-foreground-muted">
        {uniform
          ? "Sentence rhythm: flat. Every sentence is about the same length."
          : "Sentence rhythm: varied, the way people actually write."}
      </p>
    </div>
  );
}
