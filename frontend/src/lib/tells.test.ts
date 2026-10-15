import { describe, expect, it } from "vitest";
import { analyzeTells, splitSentences } from "./tells";

describe("analyzeTells", () => {
  it("flags throat-clearing, inflated words, hedges and triplets", () => {
    const r = analyzeTells(
      "It is important to note that we must delve deeper. Results could potentially vary. The plan is clear, concise, and compelling."
    );
    expect(r.counts).toEqual({ filler: 1, inflated: 1, hedge: 1, triplet: 1 });
    expect(r.matches.map((m) => m.text)).toContain("delve");
  });

  it("matches curly apostrophes and is case-insensitive", () => {
    const r = analyzeTells("In Today’s fast-paced world, things change.");
    expect(r.counts.filler).toBe(1);
  });

  it("flags generic 'in today's…' openers, not just the stock phrase", () => {
    const r = analyzeTells("In today's fast-paced digital landscape, it is important to note that x.");
    expect(r.matches[0].text).toBe("In today's fast-paced");
  });

  it("does not match inside longer words", () => {
    expect(analyzeTells("The fostered kitten was delved-free.").counts.inflated).toBe(0);
  });

  it("never returns overlapping matches", () => {
    const { matches } = analyzeTells("This serves as a testament to robust, seamless, and pivotal work.");
    for (let i = 1; i < matches.length; i++) {
      expect(matches[i].start).toBeGreaterThanOrEqual(matches[i - 1].end);
    }
  });

  it("detects uniform rhythm only with enough sentences", () => {
    const even = "One two three four five. Six seven eight nine ten. One two three four five. Six seven eight nine ten.";
    expect(analyzeTells(even).uniformRhythm).toBe(true);
    const varied = "Stop. Then the whole room went quiet for what felt like a very long time. Nobody moved. We waited until the lights came back on.";
    expect(analyzeTells(varied).uniformRhythm).toBe(false);
    expect(analyzeTells("Short. Text.").uniformRhythm).toBe(false);
  });

  it("handles empty input", () => {
    const r = analyzeTells("");
    expect(r.words).toBe(0);
    expect(r.matches).toEqual([]);
    expect(r.sentenceLengths).toEqual([]);
  });
});

describe("splitSentences", () => {
  it("splits on terminal punctuation followed by a capital", () => {
    expect(splitSentences("One. Two! Three? four")).toEqual(["One.", "Two!", "Three? four"]);
  });
});
