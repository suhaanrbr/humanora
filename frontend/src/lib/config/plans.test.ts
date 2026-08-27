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
    expect(PLANS.pro.outputVariations).toBeGreaterThan(PLANS.essential.outputVariations);
    expect(PLANS.ultra.outputVariations).toBeGreaterThan(PLANS.pro.outputVariations);
  });
});
