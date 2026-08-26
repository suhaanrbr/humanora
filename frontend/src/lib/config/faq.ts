import type { FAQItem } from "@/components/ui/FAQAccordion";

export const pricingFaq: FAQItem[] = [
  {
    question: "How does billing work?",
    answer: "Each paid plan is a single payment via Razorpay that unlocks 30 days of access at that plan's limits. There's no recurring auto-charge — when your 30 days end, you choose a plan again to continue.",
  },
  {
    question: "Can I switch plans?",
    answer: "Yes. Choosing a different paid plan starts a new 30-day period at that plan's price and limits right away.",
  },
  {
    question: "What happens when I reach my monthly allowance?",
    answer: "You'll see your usage in your dashboard as you approach your limit. You can move to a higher plan to continue humanizing within the same period.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Since there's no recurring subscription to cancel, there's nothing to turn off — your access simply runs for the 30 days you paid for and isn't renewed automatically.",
  },
  {
    question: "What counts as a humanization?",
    answer: "One humanization is one rewrite request submitted to HUMANORA, regardless of how many output variations you generate from it.",
  },
  {
    question: "Are unused requests carried over?",
    answer: "No — each plan's allowance applies to its own 30-day period and doesn't carry over.",
  },
  {
    question: "What is My Voice?",
    answer: "My Voice lets you provide writing samples so HUMANORA learns your writing style. Building a profile is available on any account; applying it to rewrites is available on Essential (preview) and Pro/Ultra (full).",
  },
  {
    question: "Is there a free plan?",
    answer: "Yes — every account gets one complimentary humanization, up to 200 characters, with no credit card required. It's a one-time trial, not a monthly allowance.",
  },
];

export const apiFaq: FAQItem[] = [
  {
    question: "How is API usage measured?",
    answer: "Usage is planned to be measured per humanization request and total words processed, similar to the consumer product.",
  },
  {
    question: "How are API keys managed?",
    answer: "A key management dashboard is planned for developer accounts once the API moves beyond developer preview.",
  },
  {
    question: "What languages are supported?",
    answer: "English is the initial focus. Additional language support is architected for, not yet available.",
  },
  {
    question: "Are rate limits applied?",
    answer: "Yes — planned rate limits will scale with your API plan to keep the service reliable for everyone.",
  },
  {
    question: "Can I upgrade my API plan?",
    answer: "Yes, upgrading between Developer, Growth, and Enterprise will be supported once billing is live.",
  },
  {
    question: "Is API access available yet?",
    answer: "Not yet — the HUMANORA API is currently in developer preview. This page describes the planned offering.",
  },
];
