/**
 * HUMANORA's single authoritative plan configuration. Marketing pages,
 * the workspace paywall, checkout, and server-side entitlement/payment
 * checks all derive from this file — nowhere else should a quota,
 * price, or character limit be hard-coded.
 *
 * Prices are canonical INR (HUMANORA's owner is an individual in India
 * billing through Razorpay — see lib/payments/razorpay.ts). Amounts are
 * whole rupees here; payment code converts to paise (`* 100`) only at
 * the Razorpay API boundary, never anywhere else.
 */

export const PAID_PLAN_IDS = ["essential", "pro", "ultra"] as const;
export type PaidPlanId = (typeof PAID_PLAN_IDS)[number];
export type PlanId = "free" | PaidPlanId;

export interface PlanConfig {
  id: PlanId;
  name: string;
  monthlyPriceInr: number;
  /** Humanizations allowed per calendar month. `free` doesn't use this —
   * it uses the one-lifetime-use rule instead (see entitlement.ts). */
  monthlyHumanizations: number;
  /** Max input length in characters for a single humanize request. */
  maxInputChars: number;
  /** Independent rewrite candidates produced per request (lib/ai/humanize.ts). */
  outputVariations: number;
  /** How many named My Voice profiles this plan may own at once (0 = feature unavailable). */
  maxVoiceProfiles: number;
  /** A free-text steering instruction appended to the rewrite prompt
   * (e.g. "avoid em dashes", "keep it under 100 words") — genuinely
   * changes model behavior, not a cosmetic toggle. */
  customInstructions: boolean;
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
    monthlyPriceInr: 0,
    monthlyHumanizations: 0, // not used — see FREE_TRIAL_MAX_CHARS below
    maxInputChars: 200,
    outputVariations: 1,
    maxVoiceProfiles: 0,
    customInstructions: false,
    prioritySupport: false,
  },
  essential: {
    id: "essential",
    name: "Essential",
    monthlyPriceInr: 399,
    monthlyHumanizations: 100,
    maxInputChars: 1500 * 6,
    outputVariations: 2,
    maxVoiceProfiles: 1,
    customInstructions: false,
    prioritySupport: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPriceInr: 599,
    monthlyHumanizations: 300,
    maxInputChars: 3000 * 6,
    outputVariations: 3,
    maxVoiceProfiles: 3,
    customInstructions: true,
    prioritySupport: true,
  },
  ultra: {
    id: "ultra",
    name: "Ultra",
    monthlyPriceInr: 999,
    // "Unlimited*" in marketing copy — this is the real fair-use ceiling
    // behind that asterisk. Never remove the technical cap.
    monthlyHumanizations: 2000,
    maxInputChars: 5000 * 6,
    outputVariations: 5,
    maxVoiceProfiles: 5,
    customInstructions: true,
    prioritySupport: true,
  },
};

/** The one-lifetime complimentary humanization every new account gets.
 * Not a recurring monthly allowance — see docs/ENTITLEMENTS.md for the
 * exact consumption rule and concurrency guarantee. */
export const FREE_TRIAL_MAX_CHARS = 200;

/** Every paid plan bills for a 30-day access period — see
 * lib/payments/orders.ts for why HUMANORA uses one-time orders rather
 * than Razorpay recurring Subscriptions for V1. */
export const BILLING_PERIOD_DAYS = 30;

export function getPlan(id: PlanId): PlanConfig {
  return PLANS[id];
}

export function isPaidPlan(id: PlanId): id is PaidPlanId {
  return (PAID_PLAN_IDS as readonly string[]).includes(id);
}

export function isPaidPlanId(id: string): id is PaidPlanId {
  return (PAID_PLAN_IDS as readonly string[]).includes(id);
}
