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
    answer: "One humanization is one rewrite request submitted to Humanora, regardless of how many output variations you generate from it.",
  },
  {
    question: "Are unused requests carried over?",
    answer: "No — each plan's allowance applies to its own 30-day period and doesn't carry over.",
  },
  {
    question: "What is My Voice?",
    answer: "My Voice lets you provide writing samples so Humanora learns your writing style. Building a profile is available on any account; applying it to rewrites is available on Essential (preview) and Pro/Ultra (full).",
  },
  {
    question: "Is there a free plan?",
    answer: "Yes — every account gets one complimentary humanization, up to 200 characters, with no credit card required. It's a one-time trial, not a monthly allowance.",
  },
];

/** Questions people ask before they sign up. Shown on the homepage. */
export const productFaq: FAQItem[] = [
  {
    question: "Will Humanora's rewrites get past AI detectors or Turnitin?",
    answer: "No one can honestly promise that. Detectors are inconsistent and regularly flag human writing as well as missing machine writing. Humanora is built to make writing better: clearer, more varied and closer to your own voice. That is a different goal from beating a particular detector.",
  },
  {
    question: "Can I use it for coursework?",
    answer: "That depends on your institution. Many allow AI help with drafting or editing and some don't, so check your course's policy. Where AI assistance is allowed, Humanora helps the final text read like your own writing.",
  },
  {
    question: "Will it change my facts or citations?",
    answer: "It's designed not to. After every rewrite, a meaning check compares figures, dates, links and direct quotations against your original and flags anything that changed. Treat it as a safety net and read anything important before you send it.",
  },
  {
    question: "How is this different from asking a chatbot to rewrite something?",
    answer: "You don't have to write prompts. The editing instructions that target AI tells are built in, and you choose one of six writing modes. My Voice keeps a profile of your style between sessions, every result is checked for changed facts, and everything is saved to your Library.",
  },
  {
    question: "Is my writing used to train AI?",
    answer: "Humanora doesn't use your writing to train any model. To produce a result, your text is sent to our AI provider, which processes it under its own terms. Our trust page explains exactly what is stored and how to delete it.",
  },
  {
    question: "Which languages does it support?",
    answer: "Humanora is built and tested for English. Other languages may partly work, but we don't support them yet.",
  },
  {
    question: "Can I try it before paying?",
    answer: "Yes, in two ways. The tells checker on this page is free and needs no account. Every new account also gets one free rewrite of up to 200 characters, with no card required.",
  },
];
