"use client";

import { useState } from "react";
import { useToolRun } from "@/components/tools/useToolRun";
import { Choice, CopyButton, Panel, ResultPlaceholder, TextInputPanel, ToolColumns, ToolHeader, wordCount } from "@/components/tools/ToolKit";
import { SUMMARY_FORMATS, SUMMARY_LENGTHS, TOOL_LIMITS } from "@/lib/ai/tools";

type Length = (typeof SUMMARY_LENGTHS)[number];
type Format = (typeof SUMMARY_FORMATS)[number];

/** Summarizer: a summary at the chosen length, shown as prose or as key points. */
export function Summarizer() {
  const [text, setText] = useState("");
  const [length, setLength] = useState<Length>("medium");
  const [format, setFormat] = useState<Format>("paragraph");
  const { state, result, error, run } = useToolRun("summarize");

  const asText = result
    ? format === "bullets"
      ? result.keyPoints.map((p) => `• ${p}`).join("\n")
      : `${result.summary}\n\nKey points:\n${result.keyPoints.map((p) => `• ${p}`).join("\n")}`
    : "";

  return (
    <>
      <ToolHeader name="Summarizer" summary="Turn long reading into a summary you can actually use. It works only from the text you give it." />
      <ToolColumns
        input={
          <TextInputPanel
            value={text}
            onChange={setText}
            placeholder="Paste an article, chapter, report or lecture notes…"
            minChars={TOOL_LIMITS.summarize.min}
            maxChars={TOOL_LIMITS.summarize.max}
            actionLabel="Summarize"
            running={state === "running"}
            onRun={() => void run(text, { length, format })}
            options={
              <>
                <Choice
                  label="Length"
                  value={length}
                  onChange={setLength}
                  options={[
                    { value: "short", label: "Short" },
                    { value: "medium", label: "Medium" },
                    { value: "detailed", label: "Detailed" },
                  ]}
                />
                <Choice
                  label="Format"
                  value={format}
                  onChange={setFormat}
                  options={[
                    { value: "paragraph", label: "Paragraph" },
                    { value: "bullets", label: "Key points" },
                  ]}
                />
              </>
            }
          />
        }
        output={
          <Panel title="Summary" actions={state === "done" && <CopyButton text={asText} />}>
            {state === "done" && result ? (
              <div className="px-5 py-5">
                {format === "paragraph" && <p className="whitespace-pre-wrap text-[1.0625rem] leading-relaxed text-foreground [overflow-wrap:anywhere]">{result.summary}</p>}
                <p className={format === "paragraph" ? "text-app-label mt-6 text-foreground-subtle" : "text-app-label text-foreground-subtle"}>Key points</p>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {result.keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-3 text-base leading-relaxed text-foreground-muted">
                      <span className="mt-[0.7em] h-px w-3 shrink-0 bg-brand-purple" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 border-t border-border pt-4 text-sm text-foreground-subtle">
                  {wordCount(text).toLocaleString("en-IN")} words → {wordCount(asText).toLocaleString("en-IN")} words
                </p>
              </div>
            ) : (
              <ResultPlaceholder state={state} error={error} idleText="Your summary appears here." runningText="Reading and condensing…" />
            )}
          </Panel>
        }
      />
    </>
  );
}
