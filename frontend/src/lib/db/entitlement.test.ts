import { describe, it, expect } from "vitest";
import { resolvePlan, isPeriodStillValid } from "@/lib/db/entitlement";

/**
 * Pure-logic tests for entitlement resolution — the single place that
 * decides "what plan can this user actually use right now", accounting
 * for a lapsed billing period. No database involved.
 */

describe("isPeriodStillValid", () => {
  it("treats a null period end (free plan) as always valid", () => {
    expect(isPeriodStillValid(null)).toBe(true);
  });

  it("treats a future date as valid", () => {
    expect(isPeriodStillValid(new Date(Date.now() + 10_000))).toBe(true);
  });

  it("treats a past date as expired", () => {
    expect(isPeriodStillValid(new Date(Date.now() - 10_000))).toBe(false);
  });
});

describe("resolvePlan", () => {
  it("free plan with active status stays free", () => {
    expect(resolvePlan({ plan: "free", status: "active", currentPeriodEnd: null })).toBe("free");
  });

  it("a paid plan with active status and a future period end resolves to that plan", () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
    expect(resolvePlan({ plan: "pro", status: "active", currentPeriodEnd: future })).toBe("pro");
  });

  it("a paid plan whose period has lapsed falls back to free, even though status is still 'active'", () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(resolvePlan({ plan: "pro", status: "active", currentPeriodEnd: past })).toBe("free");
  });

  it("any non-active status falls back to free regardless of plan or period", () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
    expect(resolvePlan({ plan: "ultra", status: "canceled", currentPeriodEnd: future })).toBe("free");
    expect(resolvePlan({ plan: "ultra", status: "past_due", currentPeriodEnd: future })).toBe("free");
    expect(resolvePlan({ plan: "ultra", status: "expired", currentPeriodEnd: future })).toBe("free");
  });
});
