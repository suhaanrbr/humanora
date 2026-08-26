import { describe, it, expect } from "vitest";
import { checkMeaningPreservation } from "@/lib/ai/meaningCheck";

describe("checkMeaningPreservation", () => {
  it("flags nothing for plain prose with no facts to preserve", () => {
    const result = checkMeaningPreservation("This is a simple sentence.", "This sentence is simple.");
    expect(result.items).toHaveLength(0);
    expect(result.allPreserved).toBe(true);
  });

  it("detects a preserved number", () => {
    const result = checkMeaningPreservation("We sold 42 units last week.", "Last week, 42 units were sold.");
    expect(result.items.some((i) => i.type === "number" && i.value === "42" && i.preserved)).toBe(true);
    expect(result.allPreserved).toBe(true);
  });

  it("detects a dropped number", () => {
    const result = checkMeaningPreservation("We sold 42 units last week.", "Last week, several units were sold.");
    const item = result.items.find((i) => i.type === "number" && i.value === "42");
    expect(item?.preserved).toBe(false);
    expect(result.allPreserved).toBe(false);
  });

  it("tolerates thousands-separator formatting differences", () => {
    const result = checkMeaningPreservation("Revenue reached 1,000 dollars.", "Revenue reached 1000 dollars.");
    const item = result.items.find((i) => i.type === "number" && i.value === "1,000");
    expect(item?.preserved).toBe(true);
  });

  it("detects a preserved percentage", () => {
    const result = checkMeaningPreservation("Growth was 25% this quarter.", "This quarter saw 25% growth.");
    expect(result.items.some((i) => i.type === "percentage" && i.preserved)).toBe(true);
  });

  it("detects a dropped percentage", () => {
    const result = checkMeaningPreservation("Growth was 25% this quarter.", "This quarter saw strong growth.");
    const item = result.items.find((i) => i.type === "percentage");
    expect(item?.preserved).toBe(false);
  });

  it("detects a preserved URL", () => {
    const result = checkMeaningPreservation(
      "Visit https://example.com/docs for details.",
      "For details, go to https://example.com/docs."
    );
    expect(result.items.find((i) => i.type === "url")?.preserved).toBe(true);
  });

  it("detects a dropped URL", () => {
    const result = checkMeaningPreservation("Visit https://example.com/docs for details.", "See the documentation for details.");
    expect(result.items.find((i) => i.type === "url")?.preserved).toBe(false);
  });

  it("detects a preserved textual date", () => {
    const result = checkMeaningPreservation("The meeting is on March 5, 2026.", "We'll meet on March 5, 2026.");
    expect(result.items.find((i) => i.type === "date")?.preserved).toBe(true);
  });

  it("detects a dropped quoted phrase", () => {
    const result = checkMeaningPreservation('She said "we will ship on time".', "She gave an optimistic timeline.");
    const item = result.items.find((i) => i.type === "quote");
    expect(item?.preserved).toBe(false);
  });

  it("does not double-count digits inside an already-matched percentage as a separate number", () => {
    const result = checkMeaningPreservation("Sales grew 25% this year.", "Sales grew 25% this year.");
    expect(result.items.filter((i) => i.type === "number" && i.value === "25")).toHaveLength(0);
  });
});
