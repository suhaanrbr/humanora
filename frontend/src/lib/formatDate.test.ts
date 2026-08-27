import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime } from "@/lib/formatDate";

// Regression test for a real hydration-mismatch bug: these must always
// use an explicit locale so server (Node's default locale) and client
// (the browser's default locale) never disagree on formatting.
describe("formatDate / formatDateTime", () => {
  const date = new Date("2026-03-05T14:30:00Z");

  it("formatDate is deterministic regardless of environment locale", () => {
    expect(formatDate(date)).toBe("March 5, 2026");
  });

  it("formatDateTime is deterministic regardless of environment locale", () => {
    expect(formatDateTime(date)).toMatch(/^3\/5\/2026, \d{1,2}:\d{2} (AM|PM)$/);
  });

  it("accepts both Date objects and ISO strings", () => {
    expect(formatDate(date.toISOString())).toBe(formatDate(date));
  });
});
