"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToolRun } from "@/components/tools/useToolRun";
import { Choice, CopyButton, Panel, ResultPlaceholder, TextInputPanel, ToolColumns, ToolHeader } from "@/components/tools/ToolKit";
import { QUIZ_DIFFICULTIES, QUIZ_TYPES, TOOL_LIMITS, type QuizResult } from "@/lib/ai/tools";
import { cn } from "@/lib/cn";

type Count = 5 | 10 | 15;
type Difficulty = (typeof QUIZ_DIFFICULTIES)[number];
type Types = (typeof QUIZ_TYPES)[number];

/** Quiz Generator: makes a quiz from the user's material, then lets them take it. */
export function QuizGenerator() {
  const [text, setText] = useState("");
  const [count, setCount] = useState<Count>(10);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [types, setTypes] = useState<Types>("mixed");
  const { state, result, error, run } = useToolRun("quiz");

  return (
    <>
      <ToolHeader name="Quiz Generator" summary="Make a practice quiz from your notes or reading, then take it and see your score, with an explanation for every answer." />
      <ToolColumns
        input={
          <TextInputPanel
            value={text}
            onChange={setText}
            placeholder="Paste the notes, chapter or article you want to be tested on…"
            minChars={TOOL_LIMITS.quiz.min}
            maxChars={TOOL_LIMITS.quiz.max}
            actionLabel="Make quiz"
            running={state === "running"}
            onRun={() => void run(text, { count, difficulty, types })}
            options={
              <>
                <Choice label="Questions" value={count} onChange={setCount} options={[5, 10, 15].map((n) => ({ value: n as Count, label: String(n) }))} />
                <Choice
                  label="Difficulty"
                  value={difficulty}
                  onChange={setDifficulty}
                  options={[
                    { value: "easy", label: "Easy" },
                    { value: "medium", label: "Medium" },
                    { value: "hard", label: "Hard" },
                  ]}
                />
                <Choice
                  label="Type"
                  value={types}
                  onChange={setTypes}
                  options={[
                    { value: "mixed", label: "Mixed" },
                    { value: "multiple-choice", label: "Multiple choice" },
                    { value: "true-false", label: "True / false" },
                  ]}
                />
              </>
            }
          />
        }
        output={
          state === "done" && result ? (
            <Quiz key={result.title + result.questions.length} quiz={result} />
          ) : (
            <Panel title="Quiz">
              <ResultPlaceholder state={state} error={error} idleText="Your quiz appears here, ready to take." runningText="Writing your questions…" />
            </Panel>
          )
        }
      />
    </>
  );
}

function quizAsText(quiz: QuizResult) {
  return [
    quiz.title,
    "",
    ...quiz.questions.flatMap((q, i) => [
      `${i + 1}. ${q.question}`,
      ...q.options.map((o, j) => `   ${String.fromCharCode(65 + j)}. ${o}`),
      `   Answer: ${q.answer}`,
      "",
    ]),
  ].join("\n");
}

function Quiz({ quiz }: { quiz: QuizResult }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);

  const gradable = quiz.questions.filter((q) => q.type !== "short-answer");
  const correct = quiz.questions.filter((q, i) => q.type !== "short-answer" && answers[i] === q.answer).length;

  return (
    <Panel title={quiz.title} actions={<CopyButton text={quizAsText(quiz)} label="Copy quiz" />}>
      {checked && (
        <div className="border-b border-border px-5 py-4" aria-live="polite">
          <p className="font-display text-3xl text-foreground">
            {correct} / {gradable.length}
          </p>
          <p className="text-sm text-foreground-subtle">
            {gradable.length < quiz.questions.length ? "Short-answer questions aren't scored; compare with the model answer." : "Review the explanations below."}
          </p>
        </div>
      )}
      <ol className="divide-y divide-border">
        {quiz.questions.map((q, i) => {
          const picked = answers[i];
          return (
            <li key={i} className="px-5 py-5">
              <fieldset>
                <legend className="text-[1.0625rem] font-semibold leading-snug text-foreground">
                  <span className="mr-2 text-foreground-subtle">{i + 1}.</span>
                  {q.question}
                </legend>
                {q.type === "short-answer" ? (
                  <textarea
                    aria-label={`Your answer to question ${i + 1}`}
                    value={picked ?? ""}
                    disabled={checked}
                    onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
                    className="focus-ring mt-3 block min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground"
                  />
                ) : (
                  <div className="mt-3 flex flex-col gap-2">
                    {q.options.map((option) => {
                      const isPicked = picked === option;
                      const isAnswer = option === q.answer;
                      return (
                        <label
                          key={option}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-base transition-colors",
                            !checked && (isPicked ? "border-foreground/40 bg-surface-hover" : "border-border hover:border-border-strong"),
                            checked && isAnswer && "border-success/60 bg-success/10",
                            checked && isPicked && !isAnswer && "border-danger/60 bg-danger/10",
                            checked && !isAnswer && !isPicked && "border-border opacity-70",
                            checked && "cursor-default"
                          )}
                        >
                          <input
                            type="radio"
                            name={`q-${i}`}
                            value={option}
                            checked={isPicked}
                            disabled={checked}
                            onChange={() => setAnswers((a) => ({ ...a, [i]: option }))}
                            className="mt-1 accent-[var(--color-brand-indigo)]"
                          />
                          <span className="text-foreground">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </fieldset>
              {checked && (
                <div className="mt-3 text-sm leading-relaxed">
                  {q.type === "short-answer" ? (
                    <p className="text-foreground">
                      <span className="font-semibold">Model answer:</span> {q.answer}
                    </p>
                  ) : (
                    <p className={picked === q.answer ? "font-semibold text-success" : "font-semibold text-danger"}>
                      {picked === q.answer ? "Correct." : picked ? `Not quite. The answer is “${q.answer}”.` : `Not answered. The answer is “${q.answer}”.`}
                    </p>
                  )}
                  <p className="mt-1 text-foreground-muted">{q.explanation}</p>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="flex justify-end gap-3 border-t border-border px-5 py-4">
        {checked ? (
          <Button
            variant="secondary"
            onClick={() => {
              setAnswers({});
              setChecked(false);
            }}
          >
            Retake quiz
          </Button>
        ) : (
          <Button onClick={() => setChecked(true)} disabled={Object.keys(answers).length === 0}>
            Check answers
          </Button>
        )}
      </div>
    </Panel>
  );
}
