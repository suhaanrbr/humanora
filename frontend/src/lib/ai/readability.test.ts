import { describe, it, expect } from "vitest";
import { scoreReadability } from "@/lib/ai/readability";

describe("scoreReadability", () => {
  it("returns null for empty text", () => {
    expect(scoreReadability("")).toBeNull();
    expect(scoreReadability("   ")).toBeNull();
  });

  it("scores simple short sentences as easy", () => {
    const result = scoreReadability("The cat sat on the mat. It was warm. The sun was out.");
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(60);
  });

  it("scores long, complex sentences as harder", () => {
    const result = scoreReadability(
      "Notwithstanding the aforementioned considerations, the multifaceted implications of the organizational restructuring necessitate a comprehensive reevaluation of established methodological frameworks."
    );
    expect(result).not.toBeNull();
    expect(result!.score).toBeLessThan(50);
  });

  it("always returns a score within 0-100", () => {
    const result = scoreReadability("Word. ".repeat(50));
    expect(result!.score).toBeGreaterThanOrEqual(0);
    expect(result!.score).toBeLessThanOrEqual(100);
  });
});
