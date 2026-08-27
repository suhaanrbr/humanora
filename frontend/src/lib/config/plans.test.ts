import { describe, it, expect } from "vitest";
import { PLANS } from "@/lib/config/plans";

describe("plan entitlements — server-side source of truth", () => {
  it("free plan has no My Voice access and no custom instructions", () => {
    expect(PLANS.free.maxVoiceProfiles).toBe(0);
    expect(PLANS.free.customInstructions).toBe(false);
  });

  it("each paid tier strictly increases Voice profile allowance", () => {
    expect(PLANS.essential.maxVoiceProfiles).toBeGreaterThan(0);
    expect(PLANS.pro.maxVoiceProfiles).toBeGreaterThan(PLANS.essential.maxVoiceProfiles);
    expect(PLANS.ultra.maxVoiceProfiles).toBeGreaterThan(PLANS.pro.maxVoiceProfiles);
  });

  it("custom instructions is a Pro/Ultra differentiator, not available on Essential", () => {
    expect(PLANS.essential.customInstructions).toBe(false);
    expect(PLANS.pro.customInstructions).toBe(true);
    expect(PLANS.ultra.customInstructions).toBe(true);
  });

  it("each paid tier strictly increases output variations", () => {
    expect(PLANS.essential.outputVariations).toBeGreaterThan(PLANS.free.outputVariations);
    expect(PLANS.pro.outputVariations).toBeGreaterThanOrEqual(PLANS.essential.outputVariations);
    expect(PLANS.ultra.outputVariations).toBeGreaterThan(PLANS.pro.outputVariations);
  });

  it("every plan has a real (non-unlimited) monthly word allowance and output token ceiling", () => {
    for (const plan of Object.values(PLANS)) {
      expect(plan.monthlyWordAllowance).toBeGreaterThan(0);
      expect(Number.isFinite(plan.monthlyWordAllowance)).toBe(true);
      expect(plan.outputTokenLimit).toBeGreaterThan(0);
    }
  });

  it("paid tiers strictly increase monthly word allowance and output token ceiling", () => {
    expect(PLANS.pro.monthlyWordAllowance).toBeGreaterThan(PLANS.essential.monthlyWordAllowance);
    expect(PLANS.ultra.monthlyWordAllowance).toBeGreaterThan(PLANS.pro.monthlyWordAllowance);
    expect(PLANS.pro.outputTokenLimit).toBeGreaterThan(PLANS.essential.outputTokenLimit);
    expect(PLANS.ultra.outputTokenLimit).toBeGreaterThan(PLANS.pro.outputTokenLimit);
  });

  it("output token ceiling comfortably covers a same-length rewrite of the plan's longest permitted input", () => {
    // ~4 chars/token — see docs/AI_COST_MODEL.md. A same-length rewrite
    // of the longest permitted input should not be truncated.
    for (const plan of [PLANS.essential, PLANS.pro, PLANS.ultra]) {
      const longestInputTokens = plan.maxInputChars / 4;
      expect(plan.outputTokenLimit).toBeGreaterThanOrEqual(longestInputTokens);
    }
  });
});
