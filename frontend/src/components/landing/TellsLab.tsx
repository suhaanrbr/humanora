"use client";

import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { analyzeTells, TELL_LABELS, type TellKind, type TellsReport } from "@/lib/tells";
import { cn } from "@/lib/cn";

const SAMPLE =
  "In today's fast-paced digital landscape, it is important to note that effective communication plays a crucial role in success. Teams must leverage robust tools to foster collaboration. A clear, concise, and compelling message can unlock new opportunities. Ultimately, the right approach depends on a variety of factors.";

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
            <div className="flex items-center gap-4">
              {text !== SAMPLE && (
                <button type="button" onClick={() => setText(SAMPLE)} className="focus-ring rounded-sm hover:text-foreground">
                  Use sample
                </button>
              )}
              {text && (
                <button type="button" onClick={() => setText("")} className="focus-ring rounded-sm hover:text-foreground">
                  Clear
                </button>
              )}
            </div>
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
