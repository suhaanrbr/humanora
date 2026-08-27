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
  /**
   * Total INPUT words a plan may submit across a calendar month, checked
   * atomically alongside `monthlyHumanizations` (lib/db/usage.ts) BEFORE
   * every Gemini call. Exists because `monthlyHumanizations` alone
   * doesn't bound spend: nothing previously stopped a paid account from
   * submitting max-length text on every single one of its monthly
   * humanizations, and `outputVariations` re-sends that same input once
   * per candidate — see docs/AI_COST_MODEL.md for the full derivation.
   * Sized so that realistic mixed usage (mostly short/medium requests,
   * occasional long ones) keeps modeled Gemini cost at roughly 9-11% of
   * plan revenue even in a deliberately pessimistic estimate.
   */
  monthlyWordAllowance: number;
  /**
   * Ceiling passed as Gemini's `maxOutputTokens` for this plan (lib/ai/
   * humanize.ts scales the actual per-call value down from this based on
   * input length — most requests use far less). Sized to avoid
   * truncating a legitimate max-length rewrite for this plan's
   * `maxInputChars`, while keeping the worst-case per-call cost bounded
   * — replaces a previous flat 1024-token ceiling that was both too low
   * for Pro/Ultra's longest inputs (real truncation risk) and unnecessarily
   * high for Essential/Free's shortest ones (real, avoidable cost).
   */
  outputTokenLimit: number;
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
    monthlyWordAllowance: 35, // matches the one-time ~200-char trial — there is no recurring monthly grant on Free
    outputTokenLimit: 256,
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
    monthlyWordAllowance: 25_000,
    outputTokenLimit: 3072,
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPriceInr: 599,
    // Was 300/mo with 3 output variations — reduced alongside a genuine
    // per-plan monthlyWordAllowance below (previously unbounded total
    // monthly volume) after the AI cost model showed the old numbers
    // could exceed plan revenue on Gemini cost alone in a realistic
    // heavy-usage month. See docs/AI_COST_MODEL.md.
    monthlyHumanizations: 150,
    maxInputChars: 3000 * 6,
    outputVariations: 2,
    maxVoiceProfiles: 3,
    customInstructions: true,
    prioritySupport: true,
    monthlyWordAllowance: 45_000,
    outputTokenLimit: 6144,
  },
  ultra: {
    id: "ultra",
    name: "Ultra",
    monthlyPriceInr: 999,
    // Was framed as "Unlimited humanizations*" with a 2000/mo technical
    // ceiling — replaced with a real, stated number. "Unlimited" plus an
    // asterisked fine-print cap is exactly the pattern this plan should
    // not use; see docs/AI_COST_MODEL.md for why 2000/mo × 5 variations
    // was never sustainable at this price regardless of framing.
    monthlyHumanizations: 180,
    maxInputChars: 5000 * 6,
    outputVariations: 3,
    maxVoiceProfiles: 5,
    customInstructions: true,
    prioritySupport: true,
    monthlyWordAllowance: 55_000,
    outputTokenLimit: 10_240,
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
