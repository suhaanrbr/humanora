import type { PlanId } from "@/lib/config/plans";

/**
 * Content for the /for/[audience] pages. Every capability named here
 * exists in the product today; the examples are illustrative rewrites,
 * not customer quotes.
 */
export interface Audience {
  slug: "students" | "professionals" | "writers";
  name: string;
  title: string;
  lede: string;
  before: string;
  after: string;
  exampleLabel: string;
  jobs: { title: string; body: string }[];
  modes: string[];
  plan: PlanId;
  planReason: string;
  note?: string;
}

export const audiences: Audience[] = [
  {
    slug: "students",
    name: "Students",
    title: "Coursework that sounds like the student who wrote it.",
    lede: "Use the tools your course allows for a first draft, then make the final text read like you: clear, specific, and with every citation exactly where you put it.",
    exampleLabel: "Essay paragraph, Academic mode",
    before:
      "It is evident that the aforementioned findings serve to substantiate the hypothesis that social media usage has a multifaceted impact on adolescent well-being (Kelly et al., 2019).",
    after:
      "These findings support the hypothesis that social media affects adolescent well-being in several ways (Kelly et al., 2019).",
    jobs: [
      {
        title: "Essays and coursework",
        body: "Academic mode tightens stiff, padded prose without flattening the argument, and the meaning check confirms every figure and quotation survived.",
      },
      {
        title: "Personal statements",
        body: "Admissions readers see thousands of generic openings. My Voice pulls the draft back toward the way you actually write.",
      },
      {
        title: "Reading and revision",
        body: "Study turns a dense chapter into a summary, a plain-language explanation, or structured notes to revise from, using only the text you give it.",
      },
    ],
    modes: ["Academic", "Natural", "Concise"],
    plan: "essential",
    planReason: "Academic mode, Study, 1,500 words per request and a My Voice profile, at the lowest paid price.",
    note: "Follow your institution’s rules on AI assistance. Humanora improves writing; it doesn’t make undisclosed AI use acceptable where it isn’t.",
  },
  {
    slug: "professionals",
    name: "Professionals",
    title: "Work writing that doesn’t read like everyone else’s.",
    lede: "Keep the speed of an AI first draft without sending the same polished, interchangeable email your reader got five times this morning.",
    exampleLabel: "Client email, Professional mode",
    before:
      "I hope this email finds you well. I wanted to reach out to touch base regarding the proposal, as I believe it would be beneficial to align on next steps at your earliest convenience.",
    after: "Could we find 20 minutes this week to agree next steps on the proposal?",
    jobs: [
      {
        title: "Email and updates",
        body: "Professional and Concise modes cut the throat-clearing that makes AI-drafted email easy to spot and easy to ignore.",
      },
      {
        title: "Reports and proposals",
        body: "Long documents keep their numbers intact. The meaning check flags any figure, date or link that changed.",
      },
      {
        title: "One voice across your work",
        body: "Keep separate My Voice profiles for client work and internal notes, with standing custom instructions for each.",
      },
    ],
    modes: ["Professional", "Concise", "Persuasive"],
    plan: "pro",
    planReason: "All six modes, 3,000 words per request, three voice profiles and custom instructions.",
  },
  {
    slug: "writers",
    name: "Writers and creators",
    title: "Use AI for the scaffolding. Keep the voice.",
    lede: "Research, outlines and rough drafts are fair game for AI. The voice your readers subscribed for isn’t. Humanora puts it back.",
    exampleLabel: "Newsletter intro, Natural mode with My Voice",
    before:
      "In today’s ever-evolving digital landscape, creators must navigate a myriad of challenges in order to unlock their full potential and foster meaningful connections with their audience.",
    after: "Making things online is harder than it looks. Here’s what kept me going this month.",
    jobs: [
      {
        title: "Posts and newsletters",
        body: "Natural and Casual modes, steered by My Voice, keep an AI-assisted draft sounding like your last hundred issues.",
      },
      {
        title: "Long-form drafts",
        body: "Up to 5,000 words per request on Ultra, so a whole chapter or long essay stays consistent from first paragraph to last.",
      },
      {
        title: "Several voices",
        body: "Up to five voice profiles on Ultra: one for the newsletter, one for scripts, one for client work.",
      },
    ],
    modes: ["Natural", "Casual", "Persuasive"],
    plan: "ultra",
    planReason: "The longest requests, three versions of every rewrite, and five voice profiles.",
  },
];

export function getAudience(slug: string) {
  return audiences.find((a) => a.slug === slug);
}
