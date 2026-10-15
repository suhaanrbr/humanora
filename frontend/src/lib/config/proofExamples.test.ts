import { describe, expect, it } from "vitest";
import { writingModes } from "@/lib/config/modes";
import { checkMeaningPreservation } from "@/lib/ai/meaningCheck";
import { PROOF_EXAMPLES, PROOF_ORIGINAL, cleanText, draftText, keptFigures } from "./proofExamples";

describe("homepage proof examples", () => {
  it("covers every writing mode, in the same order as the product", () => {
    expect(PROOF_EXAMPLES.map((e) => e.mode)).toEqual(writingModes.map((m) => m.name));
  });

  for (const example of PROOF_EXAMPLES) {
    describe(example.mode, () => {
      it("marks up the identical original draft", () => {
        expect(draftText(example.segments)).toBe(PROOF_ORIGINAL);
      });

      it("produces clean copy with no doubled or stray spaces", () => {
        const clean = cleanText(example.segments);
        expect(clean).toBe(clean.trim());
        expect(clean).not.toMatch(/\s{2,}|\s[.,:]/);
      });

      it("keeps all three figures, and the real meaning check agrees", () => {
        expect(keptFigures(example.segments)).toBe(3);
        expect(checkMeaningPreservation(PROOF_ORIGINAL, cleanText(example.segments)).allPreserved).toBe(true);
      });
    });
  }
});
