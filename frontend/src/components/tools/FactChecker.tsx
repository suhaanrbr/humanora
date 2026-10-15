"use client";

import { useState } from "react";
import { useToolRun } from "@/components/tools/useToolRun";
import { Panel, ResultPlaceholder, TextInputPanel, ToolColumns, ToolHeader } from "@/components/tools/ToolKit";
import { TOOL_LIMITS, type FactCheckResult } from "@/lib/ai/tools";
import { cn } from "@/lib/cn";

type Verdict = FactCheckResult["claims"][number]["verdict"];

const VERDICT: Record<Verdict, { label: string; className: string }> = {
  supported: { label: "Supported", className: "border-success/40 bg-success/10 text-success" },
  contradicted: { label: "Contradicted", className: "border-danger/40 bg-danger/10 text-danger" },
  mixed: { label: "Partly right", className: "border-warning/40 bg-warning/10 text-warning" },
  unverified: { label: "Couldn’t verify", className: "border-border-strong bg-surface-hover text-foreground-muted" },
};

const SAMPLE =
  "The Eiffel Tower was completed in 1889 for the World's Fair and is about 330 metres tall. The Great Wall of China is visible from the Moon with the naked eye. Mount Everest is the tallest mountain on Earth measured from sea level.";

/** Fact Checker: claims checked against live Google Search, with the sources it consulted. */
export function FactChecker() {
  const [text, setText] = useState("");
  const { state, result, error, run } = useToolRun("fact-check");

  const counts = result
    ? (Object.keys(VERDICT) as Verdict[]).map((v) => [v, result.claims.filter((c) => c.verdict === v).length] as const).filter(([, n]) => n > 0)
    : [];

  return (
    <>
      <ToolHeader
        name="Fact Checker"
        summary="Checks the factual claims in your text against live Google Search results and lists the sources it used. Treat it as a first pass: always open the sources for anything important."
      />
      <ToolColumns
        input={
          <TextInputPanel
            value={text}
            onChange={setText}
            placeholder="Paste a draft with figures, dates, events or quotes to check…"
            minChars={TOOL_LIMITS["fact-check"].min}
            maxChars={TOOL_LIMITS["fact-check"].max}
            actionLabel="Check facts"
            running={state === "running"}
            sample={SAMPLE}
            onRun={() => void run(text)}
          />
        }
        output={
          <Panel title="Findings">
            {state === "done" && result ? (
              <div>
                {result.method === "knowledge" && (
                  <p className="border-b border-border bg-warning/10 px-5 py-3 text-sm text-foreground">
                    <span className="font-semibold">Not a live web search.</span> Search wasn&apos;t available, so these
                    claims were checked against the AI model&apos;s general knowledge. Confirm anything important with a
                    primary source.
                  </p>
                )}
                <div className="border-b border-border px-5 py-4">
                  <p className="text-base text-foreground">{result.overview}</p>
                  {counts.length > 0 && (
                    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground-subtle">
                      {counts.map(([v, n]) => (
                        <span key={v}>
                          {n} {VERDICT[v].label.toLowerCase()}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
                {result.claims.length === 0 ? (
                  <p className="px-5 py-8 text-base text-foreground-muted">No checkable factual claims found in this text.</p>
                ) : (
                  <ol className="divide-y divide-border">
                    {result.claims.map((c, i) => (
                      <li key={i} className="px-5 py-4">
                        <span className={cn("inline-block rounded-sm border px-2 py-0.5 text-xs font-semibold", VERDICT[c.verdict].className)}>
                          {VERDICT[c.verdict].label}
                        </span>
                        <p className="mt-2 font-display text-lg leading-snug text-foreground">“{c.claim}”</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-foreground-muted">{c.explanation}</p>
                      </li>
                    ))}
                  </ol>
                )}
                {result.sources.length > 0 && (
                  <div className="border-t border-border px-5 py-4">
                    <p className="text-app-label text-foreground-subtle">Sources consulted</p>
                    <ol className="mt-3 flex flex-col gap-2 text-sm">
                      {result.sources.map((s, i) => (
                        <li key={s.url} className="flex gap-2">
                          <span className="text-foreground-subtle">{i + 1}.</span>
                          <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="focus-ring break-words rounded-sm text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground">
                            {s.title}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ) : (
              <ResultPlaceholder
                state={state}
                error={error}
                idleText="Each claim appears here with a verdict, an explanation, and the sources checked."
                runningText="Searching and checking each claim. This can take up to a minute…"
              />
            )}
          </Panel>
        }
      />
    </>
  );
}
