"use client";

import { useState } from "react";
import { useToolRun } from "@/components/tools/useToolRun";
import { Choice, CopyButton, Panel, ResultPlaceholder, TextInputPanel, ToolColumns, ToolHeader, wordCount } from "@/components/tools/ToolKit";
import { PARAPHRASE_STYLES, TOOL_LIMITS } from "@/lib/ai/tools";

type Style = (typeof PARAPHRASE_STYLES)[number];

const STYLE_LABELS: Record<Style, string> = {
  standard: "Standard",
  fluent: "Fluent",
  formal: "Formal",
  simple: "Simple",
  creative: "Creative",
  shorter: "Shorter",
  longer: "Longer",
};

const SAMPLE =
  "The committee has decided to postpone the launch of the new programme until the spring, because the pilot results showed that participants needed more support during the first few weeks.";

/** Paraphraser: three distinct versions in the chosen style, each one copyable or reusable as the new input. */
export function Paraphraser() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState<Style>("standard");
  const { state, result, error, run } = useToolRun("paraphrase");

  return (
    <>
      <ToolHeader name="Paraphraser" summary="Reword any passage in seven styles, with three versions to choose from. Facts, names and figures stay exactly as written." />
      <ToolColumns
        input={
          <TextInputPanel
            value={text}
            onChange={setText}
            placeholder="Paste the passage you want reworded…"
            minChars={TOOL_LIMITS.paraphrase.min}
            maxChars={TOOL_LIMITS.paraphrase.max}
            actionLabel="Paraphrase"
            running={state === "running"}
            sample={SAMPLE}
            onRun={() => void run(text, { style })}
            options={
              <Choice label="Style" value={style} onChange={setStyle} options={PARAPHRASE_STYLES.map((s) => ({ value: s, label: STYLE_LABELS[s] }))} />
            }
          />
        }
        output={
          <Panel title={state === "done" ? "Three versions" : "Versions"}>
            {state === "done" && result ? (
              <ol className="divide-y divide-border">
                {result.versions.map((version, i) => (
                  <li key={i} className="px-5 py-5">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-app-label text-foreground-subtle">
                        Version {i + 1} · {wordCount(version)} words
                      </p>
                      <div className="flex gap-4">
                        <CopyButton text={version} />
                        <button type="button" onClick={() => setText(version)} className="focus-ring rounded-sm text-sm text-foreground-subtle hover:text-foreground">
                          Use as input
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-[1.0625rem] leading-relaxed text-foreground [overflow-wrap:anywhere]">{version}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <ResultPlaceholder state={state} error={error} idleText="Three reworded versions appear here." runningText="Writing three versions…" />
            )}
          </Panel>
        }
      />
    </>
  );
}
