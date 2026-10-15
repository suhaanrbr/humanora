/**
 * Every tool in Humanora, in one list: the dashboard Tools hub, the
 * sidebar, the public /tools page and the footer all read from here.
 * Only shipped tools belong in this list.
 */
export interface ToolInfo {
  slug: string;
  name: string;
  /** One line, for cards and menus. */
  summary: string;
  /** Where it lives inside the app. */
  appHref: string;
  /** "paid" tools need a paid plan; "free" ones work for everyone. */
  access: "paid" | "free";
  /** A public, no-login page exists for this tool. */
  publicHref?: string;
  group: "write" | "check" | "study";
}

export const TOOLS: ToolInfo[] = [
  {
    slug: "humanizer",
    name: "AI Humanizer",
    summary: "Rewrite an AI-assisted draft so it reads like you wrote it, in six writing modes.",
    appHref: "/dashboard/humanize",
    access: "paid",
    group: "write",
  },
  {
    slug: "paraphraser",
    name: "Paraphraser",
    summary: "Reword any passage in seven styles, from Formal to Shorter, with three versions to choose from.",
    appHref: "/dashboard/tools/paraphraser",
    access: "paid",
    group: "write",
  },
  {
    slug: "grammar-checker",
    name: "Grammar Checker",
    summary: "Find grammar, spelling, punctuation and clarity problems, each with a fix you can apply in one click.",
    appHref: "/dashboard/tools/grammar-checker",
    access: "paid",
    group: "write",
  },
  {
    slug: "fact-checker",
    name: "Fact Checker",
    summary: "Check the claims in a draft against live Google Search results, with the sources listed.",
    appHref: "/dashboard/tools/fact-checker",
    access: "paid",
    group: "check",
  },
  {
    slug: "ai-detector",
    name: "AI Detector",
    summary: "See how likely a passage is to read as AI-written, and the specific signals behind it.",
    appHref: "/dashboard/ai-detector",
    access: "paid",
    group: "check",
  },
  {
    slug: "citation-generator",
    name: "Citation Generator",
    summary: "APA, MLA, Chicago and Harvard references and in-text citations. Paste a DOI to fill it in.",
    appHref: "/dashboard/tools/citation-generator",
    publicHref: "/tools/citation-generator",
    access: "free",
    group: "check",
  },
  {
    slug: "summarizer",
    name: "Summarizer",
    summary: "Turn long reading into a short, medium or detailed summary, as a paragraph or key points.",
    appHref: "/dashboard/tools/summarizer",
    access: "paid",
    group: "study",
  },
  {
    slug: "quiz-generator",
    name: "Quiz Generator",
    summary: "Make a practice quiz from your notes, then take it and see your score with explanations.",
    appHref: "/dashboard/tools/quiz-generator",
    access: "paid",
    group: "study",
  },
  {
    slug: "study",
    name: "Study Notes",
    summary: "Explain a hard topic at the depth you need, or turn material into structured revision notes.",
    appHref: "/dashboard/study",
    access: "paid",
    group: "study",
  },
];

export const TOOL_GROUPS: { id: ToolInfo["group"]; label: string }[] = [
  { id: "write", label: "Write and rewrite" },
  { id: "check", label: "Check and cite" },
  { id: "study", label: "Study" },
];

export function getTool(slug: string) {
  return TOOLS.find((t) => t.slug === slug);
}
