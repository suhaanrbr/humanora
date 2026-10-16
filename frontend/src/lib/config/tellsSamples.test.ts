import { describe, expect, it } from "vitest";
import { analyzeTells } from "@/lib/tells";
import { TELLS_SAMPLES } from "./tellsSamples";

describe("TELLS_SAMPLES", () => {
  it("has exactly one human-written sample", () => {
    expect(TELLS_SAMPLES.filter((s) => s.human)).toHaveLength(1);
  });

  it.each(TELLS_SAMPLES.filter((s) => !s.human).map((s) => [s.label, s] as const))(
    "%s shows several marks",
    (_, sample) => {
      expect(analyzeTells(sample.text).matches.length).toBeGreaterThanOrEqual(4);
    }
  );

  it("the human sample is left unmarked, with varied rhythm", () => {
    const human = TELLS_SAMPLES.find((s) => s.human)!;
    const report = analyzeTells(human.text);
    expect(report.matches).toHaveLength(0);
    expect(report.uniformRhythm).toBe(false);
  });

  it("every sample fits the checker's input limit", () => {
    for (const sample of TELLS_SAMPLES) expect(sample.text.length).toBeLessThanOrEqual(5000);
  });
});
