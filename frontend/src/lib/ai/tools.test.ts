import { describe, expect, it } from "vitest";
import { extractJson, outputBudget } from "./gemini";
import { cleanGrammarIssues, cleanQuizQuestions, isAiToolId, toolOptionsSchema, type QuizQuestion } from "./tools";

describe("extractJson", () => {
  it("reads bare JSON, fenced JSON, and JSON wrapped in prose", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
    expect(extractJson('```json\n{"a":2}\n```')).toEqual({ a: 2 });
    expect(extractJson('Here is the result: {"a":3} Hope it helps.')).toEqual({ a: 3 });
  });

  it("throws a user-safe error on unreadable output", () => {
    expect(() => extractJson("no json here")).toThrow(/unreadable/);
    expect(() => extractJson("{not: valid}")).toThrow(/unreadable/);
  });
});

describe("cleanGrammarIssues", () => {
  const text = "Their going to the store tomorow.";
  const issue = (original: string, suggestion: string) => ({ original, suggestion, category: "spelling" as const, explanation: "x" });

  it("keeps real fixes and drops ones that don't point at the text or change nothing", () => {
    const kept = cleanGrammarIssues(text, [
      issue("Their going", "They're going"),
      issue("tomorow", "tomorrow"),
      issue("not in the text", "anything"),
      issue("store", "store"),
      issue("tomorow", "tomorrow"),
    ]);
    expect(kept.map((i) => i.original)).toEqual(["Their going", "tomorow"]);
  });
});

describe("cleanQuizQuestions", () => {
  const q = (overrides: Partial<QuizQuestion>): QuizQuestion => ({
    type: "multiple-choice",
    question: "Q?",
    options: ["A", "B", "C", "D"],
    answer: "A",
    explanation: "",
    ...overrides,
  });

  it("drops questions that can't be graded fairly", () => {
    const kept = cleanQuizQuestions([
      q({}),
      q({ answer: "E" }), // answer not among options
      q({ options: ["A", "B"] }), // too few options
      q({ type: "true-false", options: ["True", "False"], answer: "False" }),
      q({ type: "true-false", options: ["Yes", "No"], answer: "Yes" }),
      q({ type: "short-answer", options: [], answer: "Because." }),
      q({ type: "short-answer", options: ["A"], answer: "A" }),
    ]);
    expect(kept.map((x) => `${x.type}:${x.answer}`)).toEqual(["multiple-choice:A", "true-false:False", "short-answer:Because."]);
  });
});

describe("tool options", () => {
  it("falls back to safe defaults for missing or invalid options", () => {
    expect(toolOptionsSchema.paraphrase.parse({ style: "evil" })).toEqual({ style: "standard" });
    expect(toolOptionsSchema.quiz.parse({ count: "15", difficulty: "hard" })).toEqual({ count: 15, difficulty: "hard", types: "mixed" });
    expect(toolOptionsSchema.quiz.parse({ count: 1000 })).toEqual({ count: 10, difficulty: "medium", types: "mixed" });
    expect(toolOptionsSchema.summarize.parse({})).toEqual({ length: "medium", format: "paragraph" });
  });

  it("only recognises real tool ids", () => {
    expect(isAiToolId("grammar")).toBe(true);
    expect(isAiToolId("plagiarism")).toBe(false);
  });
});

describe("outputBudget", () => {
  it("scales with input and respects the floor and ceiling", () => {
    expect(outputBudget("short", 4096)).toBe(400);
    expect(outputBudget("x".repeat(40_000), 4096)).toBe(4096);
  });
});
