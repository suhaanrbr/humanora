/**
 * HUMANORA marketing pricing display. Prices themselves are NEVER
 * redefined here — `monthlyPrice` below is read directly from
 * lib/config/plans.ts (the one authoritative, server-enforced config)
 * so the marketing page can never drift from what checkout actually
 * charges. Only display copy (audience, feature bullets, icon, badge)
 * lives here.
 *
 * There is no annual billing plan in the current Razorpay integration
 * (one-time orders per BILLING_PERIOD_DAYS — see lib/payments/orders.ts)
 * — a previous version of this page showed a discounted annual price
 * that nothing could actually charge; that toggle has been removed
 * rather than shown as a real option that doesn't exist yet.
 */

import { PLANS, type PlanId } from "@/lib/config/plans";

export interface PricingFeature {
  label: string;
}

export interface PricingPlan {
  id: PlanId;
  name: string;
  icon: "sprout" | "pen" | "star" | "bolt";
  monthlyPrice: number;
  audience: string;
  features: PricingFeature[];
  ctaLabel: string;
  highlighted?: boolean;
  badge?: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    icon: "sprout",
    monthlyPrice: PLANS.free.monthlyPriceInr,
    audience: "For people exploring HUMANORA.",
    features: [
      { label: "One complimentary humanization, ever" },
      { label: "Up to 200 characters" },
      { label: "Natural mode" },
      { label: "No credit card required" },
    ],
    ctaLabel: "Get Started",
  },
  {
    id: "essential",
    name: "Essential",
    icon: "pen",
    monthlyPrice: PLANS.essential.monthlyPriceInr,
    audience: "For students and everyday writers.",
    features: [
      { label: `${PLANS.essential.monthlyHumanizations} humanizations per month` },
      { label: `Up to ${Math.round(PLANS.essential.maxInputChars / 6).toLocaleString()} words per request` },
      { label: `${PLANS.essential.outputVariations} output variations` },
      { label: "Natural, Academic & Professional modes" },
      { label: "1 My Voice profile" },
      { label: "Full writing history" },
    ],
    ctaLabel: "Choose Essential",
  },
  {
    id: "pro",
    name: "Pro",
    icon: "star",
    monthlyPrice: PLANS.pro.monthlyPriceInr,
    audience: "For creators, professionals and frequent writers.",
    features: [
      { label: `${PLANS.pro.monthlyHumanizations} humanizations per month` },
      { label: `Up to ${Math.round(PLANS.pro.maxInputChars / 6).toLocaleString()} words per request` },
      { label: `${PLANS.pro.outputVariations} output variations` },
      { label: "All 6 writing modes" },
      { label: `${PLANS.pro.maxVoiceProfiles} My Voice profiles` },
      { label: "Custom instructions" },
      { label: "Priority support" },
    ],
    ctaLabel: "Choose Pro",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "ultra",
    name: "Ultra",
    icon: "bolt",
    monthlyPrice: PLANS.ultra.monthlyPriceInr,
    audience: "For power users and high-volume workflows.",
    features: [
      { label: "Unlimited humanizations*" },
      { label: `Up to ${Math.round(PLANS.ultra.maxInputChars / 6).toLocaleString()} words per request` },
      { label: `${PLANS.ultra.outputVariations} output variations` },
      { label: "Everything in Pro" },
      { label: `${PLANS.ultra.maxVoiceProfiles} My Voice profiles` },
      { label: "Priority support" },
    ],
    ctaLabel: "Choose Ultra",
  },
];

/** Footnote for the Ultra plan's "Unlimited humanizations*" claim. */
export const ultraFairUseNote =
  "*Subject to fair-use limits — Ultra is built for heavy everyday use, not automated bulk processing.";

export interface ComparisonRow {
  label: string;
  values: [string, string, string, string]; // Free, Essential, Pro, Ultra
}

export interface ComparisonCategory {
  title: string;
  rows: ComparisonRow[];
}

const CHECK = "✓";
const DASH = "—";

export const comparisonCategories: ComparisonCategory[] = [
  {
    title: "Pricing",
    rows: [
      {
        label: "Monthly price",
        values: [
          `₹${PLANS.free.monthlyPriceInr}`,
          `₹${PLANS.essential.monthlyPriceInr}`,
          `₹${PLANS.pro.monthlyPriceInr}`,
          `₹${PLANS.ultra.monthlyPriceInr}`,
        ],
      },
    ],
  },
  {
    title: "Usage",
    rows: [
      { label: "Humanizations", values: ["1 (lifetime)", "100/mo", "300/mo", "Unlimited*"] },
      { label: "Words per request", values: ["~35", "1,500", "3,000", "5,000"] },
      { label: "Output variations", values: ["1", "2", "3", "5"] },
      { label: "History", values: ["Limited", "Full", "Full", "Full"] },
    ],
  },
  {
    title: "Writing Modes",
    rows: [
      { label: "Natural", values: [CHECK, CHECK, CHECK, CHECK] },
      { label: "Academic", values: [DASH, CHECK, CHECK, CHECK] },
      { label: "Professional", values: [DASH, CHECK, CHECK, CHECK] },
      { label: "Concise", values: [DASH, DASH, CHECK, CHECK] },
      { label: "Casual", values: [DASH, DASH, CHECK, CHECK] },
      { label: "Persuasive", values: [DASH, DASH, CHECK, CHECK] },
    ],
  },
  {
    title: "Personalization",
    rows: [
      {
        label: "My Voice profiles",
        values: [
          DASH,
          String(PLANS.essential.maxVoiceProfiles),
          String(PLANS.pro.maxVoiceProfiles),
          String(PLANS.ultra.maxVoiceProfiles),
        ] as [string, string, string, string],
      },
      { label: "Custom instructions", values: [DASH, DASH, CHECK, CHECK] },
    ],
  },
  {
    title: "Support",
    rows: [
      { label: "Standard support", values: [CHECK, CHECK, CHECK, CHECK] },
      { label: "Priority support", values: [DASH, DASH, CHECK, CHECK] },
    ],
  },
];

export const planColumnNames = ["Free", "Essential", "Pro", "Ultra"] as const;
