/**
 * HUMANORA pricing configuration.
 *
 * This is placeholder product configuration, not a billing integration.
 * No payments are processed in this phase. Values here are the single
 * source of truth for the pricing section and the plan comparison table —
 * do not duplicate them in JSX.
 *
 * Supersedes the earlier ₹-denominated Free/Student/Pro/Team lineup with
 * a USD Free/Essential/Pro/Ultra lineup per the latest product direction.
 */

export interface PricingFeature {
  label: string;
}

export interface PricingPlan {
  id: "free" | "essential" | "pro" | "ultra";
  name: string;
  icon: "sprout" | "pen" | "star" | "bolt";
  monthlyPrice: number;
  /** Per-month price when billed annually (already discounted). */
  annualMonthlyPrice: number;
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
    monthlyPrice: 0,
    annualMonthlyPrice: 0,
    audience: "For people exploring HUMANORA.",
    features: [
      { label: "5 humanizations per month" },
      { label: "Up to 500 words per request" },
      { label: "1 output variation" },
      { label: "Natural mode" },
      { label: "Basic rewriting controls" },
      { label: "Limited history" },
      { label: "No credit card required" },
    ],
    ctaLabel: "Get Started",
  },
  {
    id: "essential",
    name: "Essential",
    icon: "pen",
    monthlyPrice: 12,
    annualMonthlyPrice: 9,
    audience: "For students and everyday writers.",
    features: [
      { label: "100 humanizations per month" },
      { label: "Up to 1,500 words per request" },
      { label: "2 output variations" },
      { label: "Natural, Academic & Professional modes" },
      { label: "Tone controls" },
      { label: "Writing intensity controls" },
      { label: "Full writing history" },
      { label: "Standard processing" },
    ],
    ctaLabel: "Choose Essential",
  },
  {
    id: "pro",
    name: "Pro",
    icon: "star",
    monthlyPrice: 18,
    annualMonthlyPrice: 14,
    audience: "For creators, professionals and frequent writers.",
    features: [
      { label: "300 humanizations per month" },
      { label: "Up to 3,000 words per request" },
      { label: "3 output variations" },
      { label: "All 6 writing modes" },
      { label: "Advanced tone controls" },
      { label: "Advanced rewrite intensity" },
      { label: "My Voice" },
      { label: "Saved preferences" },
      { label: "Document upload" },
      { label: "Priority processing & support" },
    ],
    ctaLabel: "Choose Pro",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "ultra",
    name: "Ultra",
    icon: "bolt",
    monthlyPrice: 36,
    annualMonthlyPrice: 27,
    audience: "For power users and high-volume workflows.",
    features: [
      { label: "Unlimited humanizations*" },
      { label: "Up to 5,000 words per request" },
      { label: "5 output variations" },
      { label: "Everything in Pro" },
      { label: "Advanced My Voice profiles" },
      { label: "Multiple voice profiles" },
      { label: "Batch rewriting" },
      { label: "Long-document processing" },
      { label: "Export options" },
      { label: "Early access to experimental features" },
      { label: "Premium support" },
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
      { label: "Monthly price", values: ["$0", "$12", "$18", "$36"] },
      { label: "Annual price", values: ["$0/mo", "$9/mo", "$14/mo", "$27/mo"] },
    ],
  },
  {
    title: "Usage",
    rows: [
      { label: "Humanizations", values: ["5/mo", "100/mo", "300/mo", "Unlimited*"] },
      { label: "Words per request", values: ["500", "1,500", "3,000", "5,000"] },
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
      { label: "Tone control", values: [DASH, CHECK, CHECK, CHECK] },
      { label: "Rewrite intensity", values: ["Basic", CHECK, "Advanced", "Advanced"] },
      { label: "Saved preferences", values: [DASH, DASH, CHECK, CHECK] },
      { label: "My Voice", values: [DASH, DASH, CHECK, CHECK] },
      { label: "Multiple voice profiles", values: [DASH, DASH, DASH, CHECK] },
    ],
  },
  {
    title: "Workflow",
    rows: [
      { label: "Document upload", values: [DASH, DASH, CHECK, CHECK] },
      { label: "Long-document processing", values: [DASH, DASH, DASH, CHECK] },
      { label: "Batch rewriting", values: [DASH, DASH, DASH, CHECK] },
      { label: "Export", values: [DASH, DASH, DASH, CHECK] },
      { label: "Priority processing", values: [DASH, DASH, CHECK, CHECK] },
    ],
  },
  {
    title: "Support",
    rows: [
      { label: "Standard support", values: [CHECK, CHECK, CHECK, CHECK] },
      { label: "Priority support", values: [DASH, DASH, CHECK, CHECK] },
      { label: "Premium support", values: [DASH, DASH, DASH, CHECK] },
    ],
  },
];

export const planColumnNames = ["Free", "Essential", "Pro", "Ultra"] as const;
