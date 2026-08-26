/**
 * HUMANORA's single authoritative plan configuration. Marketing pages,
 * the workspace paywall, and server-side entitlement checks all derive
 * from this file — nowhere else should a quota, price, or character
 * limit be hard-coded.
 *
 * Prices are canonical USD. Regional currency display/checkout is a
 * separate concern (see lib/payments/currency.ts) that maps onto these
 * same plan IDs — it never invents its own numbers.
 */

export const PAID_PLAN_IDS = ["essential", "pro", "ultra"] as const;
export type PaidPlanId = (typeof PAID_PLAN_IDS)[number];
export type PlanId = "free" | PaidPlanId;

export interface PlanConfig {
  id: PlanId;
  name: string;
  monthlyPriceUsd: number;
  /** Humanizations allowed per calendar month. `free` doesn't use this —
   * it uses the one-lifetime-use rule instead (see entitlement.ts). */
  monthlyHumanizations: number;
  /** Max input length in characters for a single humanize request. */
  maxInputChars: number;
  outputVariations: number;
  myVoice: "none" | "preview" | "full";
  prioritySupport: boolean;
}

// Character limits below map to the previously-approved word-based
// limits (~6 chars/word average) used in the marketing comparison table,
// so paid-plan capacity doesn't regress from what's already been shown
// to visitors.
export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    monthlyPriceUsd: 0,
    monthlyHumanizations: 0, // not used — see FREE_TRIAL_MAX_CHARS below
    maxInputChars: 200,
    outputVariations: 1,
    myVoice: "none",
    prioritySupport: false,
  },
  essential: {
    id: "essential",
    name: "Essential",
    monthlyPriceUsd: 12,
    monthlyHumanizations: 100,
    maxInputChars: 1500 * 6,
    outputVariations: 2,
    myVoice: "preview",
    prioritySupport: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPriceUsd: 18,
    monthlyHumanizations: 300,
    maxInputChars: 3000 * 6,
    outputVariations: 3,
    myVoice: "full",
    prioritySupport: true,
  },
  ultra: {
    id: "ultra",
    name: "Ultra",
    monthlyPriceUsd: 36,
    // "Unlimited*" in marketing copy — this is the real fair-use ceiling
    // behind that asterisk. Never remove the technical cap.
    monthlyHumanizations: 2000,
    maxInputChars: 5000 * 6,
    outputVariations: 5,
    myVoice: "full",
    prioritySupport: true,
  },
};

/** The one-lifetime complimentary humanization every new account gets.
 * Not a recurring monthly allowance — see docs/ENTITLEMENTS.md for the
 * exact consumption rule and concurrency guarantee. */
export const FREE_TRIAL_MAX_CHARS = 200;

export function getPlan(id: PlanId): PlanConfig {
  return PLANS[id];
}

export function isPaidPlan(id: PlanId): id is PaidPlanId {
  return (PAID_PLAN_IDS as readonly string[]).includes(id);
}
