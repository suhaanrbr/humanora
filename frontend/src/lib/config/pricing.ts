/**
 * HUMANORA pricing configuration.
 *
 * This is placeholder product configuration, not a billing integration.
 * No payments are processed in this phase. Values here are the single
 * source of truth for the pricing section — do not duplicate them in JSX.
 */

export interface PricingFeature {
  label: string;
}

export interface PricingPlan {
  id: "free" | "student" | "pro" | "team";
  name: string;
  price: string;
  billingPeriod: string;
  description: string;
  features: PricingFeature[];
  ctaLabel: string;
  highlighted?: boolean;
  badge?: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    billingPeriod: "/month",
    description: "Try HUMANORA with a limited monthly word allowance.",
    features: [
      { label: "1,000 words / month" },
      { label: "Basic humanization" },
      { label: "1 writing mode" },
    ],
    ctaLabel: "Get Started",
  },
  {
    id: "student",
    name: "Student",
    price: "₹199",
    billingPeriod: "/month",
    description: "For coursework, essays, and academic writing.",
    features: [
      { label: "20,000 words / month" },
      { label: "Standard humanization" },
      { label: "AI detector check (limited)" },
      { label: "My Voice (basic)" },
    ],
    ctaLabel: "Choose Student",
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹499",
    billingPeriod: "/month",
    description: "For professionals writing and rewriting regularly.",
    features: [
      { label: "Unlimited words" },
      { label: "Advanced humanization" },
      { label: "AI detector check (advanced)" },
      { label: "All rewrite modes" },
      { label: "My Voice (full)" },
      { label: "Priority support" },
    ],
    ctaLabel: "Choose Pro",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "team",
    name: "Team",
    price: "₹799",
    billingPeriod: "/user/month",
    description: "Shared workspace for teams writing together.",
    features: [
      { label: "Everything in Pro, plus:" },
      { label: "Team workspace" },
      { label: "Shared style guide" },
      { label: "Centralized billing" },
      { label: "Priority support" },
    ],
    ctaLabel: "Choose Team",
  },
];
