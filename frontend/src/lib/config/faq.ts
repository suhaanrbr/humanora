import type { FAQItem } from "@/components/ui/FAQAccordion";

export const pricingFaq: FAQItem[] = [
  {
    question: "Can I switch plans?",
    answer: "Yes. You'll be able to move between plans at any time once billing is live; your new plan's limits apply from your next billing cycle.",
  },
  {
    question: "What happens when I reach my monthly allowance?",
    answer: "You'll be notified as you approach your limit. You can upgrade to a higher plan, or wait for your allowance to reset next cycle.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes — plans are designed to be cancellable at any time, with no long-term lock-in.",
  },
  {
    question: "How does annual billing work?",
    answer: "Annual billing charges the discounted per-month rate up front for the year. The rates shown are the current provisional pricing.",
  },
  {
    question: "What counts as a humanization?",
    answer: "One humanization is one rewrite request submitted to HUMANORA, regardless of how many output variations you generate from it.",
  },
  {
    question: "Are unused requests carried over?",
    answer: "Not currently planned — monthly allowances reset each billing cycle rather than accumulating.",
  },
  {
    question: "What is My Voice?",
    answer: "My Voice lets you provide writing samples so HUMANORA can better match rewrites to your personal style. It's available on Pro and Ultra.",
  },
  {
    question: "Is there a free plan?",
    answer: "Yes — the Free plan includes 5 humanizations per month with no credit card required.",
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
