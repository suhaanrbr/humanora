import { describe, expect, it } from "vitest";
import { SHOWCASE_EXAMPLES, wordCount, wordsCutPercent } from "./showcase";

describe("SHOWCASE_EXAMPLES", () => {
  it.each(SHOWCASE_EXAMPLES.map((e) => [e.kind, e] as const))("%s keeps every listed fact on both sides", (_, example) => {
    expect(example.kept.length).toBeGreaterThan(0);
    for (const fact of example.kept) {
      expect(example.before.toLowerCase()).toContain(fact.toLowerCase());
      expect(example.after.toLowerCase()).toContain(fact.toLowerCase());
    }
  });

  it("every rewrite is shorter than its draft", () => {
    for (const example of SHOWCASE_EXAMPLES) {
      expect(wordCount(example.after)).toBeLessThan(wordCount(example.before));
      expect(wordsCutPercent(example)).toBeGreaterThan(0);
    }
  });
});

describe("wordsCutPercent", () => {
  it("rounds to a whole percentage", () => {
    expect(wordsCutPercent({ before: "one two three", after: "one" })).toBe(67);
  });

  it("handles an empty draft", () => {
    expect(wordsCutPercent({ before: "", after: "" })).toBe(0);
  });
});
