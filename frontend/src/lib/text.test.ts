import { describe, it, expect } from "vitest";
import { deriveTitle } from "@/lib/text";

describe("deriveTitle", () => {
  it("returns short text unchanged", () => {
    expect(deriveTitle("Hello world")).toBe("Hello world");
  });

  it("uses only the first line of multi-line input", () => {
    expect(deriveTitle("First line here\nSecond line ignored")).toBe("First line here");
  });

  it("truncates long text at a word boundary with an ellipsis", () => {
    const long = "This is a genuinely long sentence that definitely exceeds the sixty character title limit by a fair margin";
    const title = deriveTitle(long);
    expect(title.length).toBeLessThanOrEqual(62);
    expect(title.endsWith("…")).toBe(true);
    expect(title.endsWith(" …")).toBe(false);
  });

  it("falls back to 'Untitled' for empty input", () => {
    expect(deriveTitle("   ")).toBe("Untitled");
  });
});
