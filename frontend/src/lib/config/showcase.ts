/**
 * Before-and-after edits for the homepage "In practice" carousel and the
 * sign-in panel. Each one is the kind of document people bring to
 * Humanora, edited the way the named mode would edit it. Illustrative
 * rewrites, not output captured from the model.
 *
 * Every rewrite keeps the facts of the draft. `kept` lists those facts,
 * and showcase.test.ts checks each appears verbatim on both sides.
 */
export interface ShowcaseExample {
  /** The kind of document, e.g. "Cover letter". */
  kind: string;
  mode: "Natural" | "Academic" | "Professional" | "Concise" | "Casual" | "Persuasive";
  before: string;
  after: string;
  kept: string[];
}

export const SHOWCASE_EXAMPLES: ShowcaseExample[] = [
  {
    kind: "Cover letter",
    mode: "Professional",
    before:
      "I am writing to express my keen interest in the Data Analyst role, as I truly believe that my three years of SQL reporting experience aligns seamlessly with the needs of your esteemed team.",
    after: "I'm applying for the Data Analyst role, and I bring three years of SQL reporting experience.",
    kept: ["Data Analyst", "three years", "SQL"],
  },
  {
    kind: "Lab report",
    mode: "Academic",
    before:
      "The experimental results, which were obtained over the course of 12 trials, clearly and unequivocally demonstrate a significant increase of 23% in overall yield.",
    after: "Across 12 trials, yield increased significantly, by 23%.",
    kept: ["12 trials", "23%"],
  },
  {
    kind: "Work email",
    mode: "Concise",
    before:
      "I just wanted to quickly reach out in order to touch base and circle back regarding the current status of the Q4 budget, which is due on 14 November.",
    after: "Where are we on the Q4 budget? It's due 14 November.",
    kept: ["Q4", "14 November"],
  },
  {
    kind: "Essay",
    mode: "Natural",
    before:
      "In today's fast-paced digital age, it is important to note that social media plays a pivotal role in shaping the multifaceted landscape of modern political discourse.",
    after: "Social media now shapes much of modern political debate.",
    kept: ["Social media"],
  },
  {
    kind: "Product update",
    mode: "Persuasive",
    before:
      "We are thrilled to announce that our new export feature seamlessly empowers users to unlock the full potential of their data, saving teams up to 5 hours a week.",
    after: "The new export feature saves teams up to 5 hours a week. Try it on your next report.",
    kept: ["export feature", "5 hours a week"],
  },
];

export function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/** Words cut, as a whole-number percentage of the draft. */
export function wordsCutPercent(example: Pick<ShowcaseExample, "before" | "after">) {
  const before = wordCount(example.before);
  return before === 0 ? 0 : Math.round(((before - wordCount(example.after)) / before) * 100);
}
