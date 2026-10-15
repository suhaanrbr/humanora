"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToolRun } from "@/components/tools/useToolRun";
import { Choice, CopyButton, Panel, ResultPlaceholder, TextInputPanel, ToolColumns, ToolHeader } from "@/components/tools/ToolKit";
import { TOOL_LIMITS, type GrammarResult } from "@/lib/ai/tools";
import { cn } from "@/lib/cn";

type Issue = GrammarResult["issues"][number];

const CATEGORY_COLOR: Record<Issue["category"], string> = {
  grammar: "text-brand-purple",
  spelling: "text-danger",
  punctuation: "text-warning",
  clarity: "text-info",
  style: "text-brand-cyan",
};

const SAMPLE =
  "Their going to announce the results tomorow, however the team have not decided who will present it. Each of the reports have been checked twice, but there is still alot of small errors that needs fixing before it goes out.";

/**
 * Grammar Checker: each issue points at an exact span of the user's text,
 * with a one-click fix. Applying a fix edits the text in place; issues
 * whose span no longer exists drop out of the list automatically.
 */
export function GrammarChecker() {
  const [text, setText] = useState("");
  const [variant, setVariant] = useState<"uk" | "us">("uk");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { state, result, error, run } = useToolRun("grammar");

  const key = (i: Issue) => `${i.original}→${i.suggestion}`;
  const open = (result?.issues ?? []).filter((i) => !dismissed.has(key(i)) && text.includes(i.original));

  function apply(issue: Issue) {
    setText((t) => t.replace(issue.original, issue.suggestion));
  }
  function applyAll() {
    setText((t) => open.reduce((acc, issue) => acc.replace(issue.original, issue.suggestion), t));
  }

  return (
    <>
      <ToolHeader name="Grammar Checker" summary="Find grammar, spelling, punctuation and clarity problems, each with a fix you can apply in one click." />
      <ToolColumns
        input={
          <TextInputPanel
            value={text}
            onChange={setText}
            placeholder="Paste or type the text you want checked…"
            minChars={TOOL_LIMITS.grammar.min}
            maxChars={TOOL_LIMITS.grammar.max}
            actionLabel="Check text"
            running={state === "running"}
            sample={SAMPLE}
            onRun={() => {
              setDismissed(new Set());
              void run(text, { variant });
            }}
            options={
              <Choice
                label="English"
                value={variant}
                onChange={setVariant}
                options={[
                  { value: "uk", label: "British" },
                  { value: "us", label: "American" },
                ]}
              />
            }
          />
        }
        output={
          <Panel
            title={state === "done" ? `${open.length} ${open.length === 1 ? "issue" : "issues"}` : "Suggestions"}
            actions={
              state === "done" && (
                <>
                  <CopyButton text={text} label="Copy text" />
                  {open.length > 1 && (
                    <Button size="sm" variant="secondary" onClick={applyAll}>
                      Apply all
                    </Button>
                  )}
                </>
              )
            }
          >
            {state === "done" && result ? (
              <div>
                <p className="border-b border-border px-5 py-4 text-sm text-foreground-muted">{result.summary}</p>
                {open.length === 0 ? (
                  <p className="px-5 py-8 text-base text-success">
                    {result.issues.length ? "All suggestions handled. Your text is ready." : "No problems found."}
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {open.map((issue) => (
                      <li key={key(issue)} className="px-5 py-4">
                        <p className={cn("text-app-label", CATEGORY_COLOR[issue.category])}>{issue.category}</p>
                        <p className="mt-1.5 text-[1.0625rem] leading-relaxed">
                          <span className="mark-strike">{issue.original}</span>
                          <span className="mx-2 text-foreground-subtle" aria-label="becomes">
                            →
                          </span>
                          <span className="mark-insert">{issue.suggestion || "(remove)"}</span>
                        </p>
                        <p className="mt-1.5 text-sm text-foreground-muted">{issue.explanation}</p>
                        <div className="mt-3 flex gap-4">
                          <button
                            type="button"
                            onClick={() => apply(issue)}
                            className="focus-ring rounded-sm text-sm font-semibold text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground"
                          >
                            Apply
                          </button>
                          <button
                            type="button"
                            onClick={() => setDismissed((d) => new Set(d).add(key(issue)))}
                            className="focus-ring rounded-sm text-sm text-foreground-subtle hover:text-foreground"
                          >
                            Ignore
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <ResultPlaceholder
                state={state}
                error={error}
                idleText="Suggestions appear here. Each one shows the problem, the fix, and why."
                runningText="Reading your text closely…"
              />
            )}
          </Panel>
        }
      />
    </>
  );
}
