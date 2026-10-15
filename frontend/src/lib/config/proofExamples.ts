/**
 * The homepage proof card's worked examples: one AI-drafted paragraph,
 * marked up the way each writing mode would edit it. Each example is a
 * list of segments, so the draft and the clean copy are both derived
 * from the same data (see proofExamples.test.ts, which checks that every
 * mode reassembles the identical original):
 *   plain  — unchanged text, in both the draft and the clean copy
 *   strike — cut from the draft
 *   insert — added in the clean copy
 *   keep   — a protected figure, carried over verbatim
 * Illustrative rewrites, written to show each mode's register.
 */

export type SegmentKind = "plain" | "strike" | "insert" | "keep";
export type Segment = [SegmentKind, string];

export type NoteKind = "Cut" | "Changed" | "Kept";

export interface ProofExample {
  mode: "Natural" | "Academic" | "Professional" | "Concise" | "Casual" | "Persuasive";
  segments: Segment[];
  notes: [NoteKind, string][];
}

export const PROOF_ORIGINAL =
  "In today's rapidly evolving market landscape, it is worth noting that our Q3 performance was truly remarkable, with revenue increasing by 18% to £4.7 million [4]. This growth serves as a testament to the team's unwavering dedication.";

const OPENER = "In today's rapidly evolving market landscape, it is worth noting that our ";
const CLOSER = "This growth serves as a testament to the team's unwavering dedication.";

// "18% to £4.7 million [4]" — the three protected figures, shared by every mode.
const FIGURES: Segment[] = [
  ["keep", "18%"],
  ["plain", " to "],
  ["keep", "£4.7 million"],
  ["plain", " "],
  ["keep", "[4]"],
];

export const PROOF_EXAMPLES: ProofExample[] = [
  {
    mode: "Natural",
    segments: [
      ["strike", `${OPENER}Q3 performance was truly remarkable, with revenue increasing by`],
      ["insert", "Q3 went well. Revenue rose"],
      ["plain", " "],
      ...FIGURES,
      ["strike", `. ${CLOSER}`],
      ["insert", ", and that’s down to the team."],
    ],
    notes: [
      ["Cut", "Formal scaffolding"],
      ["Changed", "One long sentence into two"],
      ["Kept", "Figures and citation, verbatim"],
    ],
  },
  {
    mode: "Academic",
    segments: [
      ["strike", OPENER],
      ["plain", "Q3 performance was "],
      ["strike", "truly remarkable"],
      ["insert", "strong"],
      ["plain", ", with revenue increasing by "],
      ...FIGURES,
      ["plain", ". This growth "],
      ["strike", "serves as a testament to the team's unwavering dedication."],
      ["insert", "reflects the team’s sustained effort."],
    ],
    notes: [
      ["Cut", "Throat-clearing opener"],
      ["Changed", "Praise into a measured claim"],
      ["Kept", "Figures and citation, verbatim"],
    ],
  },
  {
    mode: "Professional",
    segments: [
      ["strike", OPENER.trimEnd()],
      ["insert", "Our"],
      ["plain", " Q3 performance was "],
      ["strike", "truly remarkable, with revenue increasing by"],
      ["insert", "strong: revenue rose"],
      ["plain", " "],
      ...FIGURES,
      ["plain", ". "],
      ["strike", CLOSER],
      ["insert", "The team earned it."],
    ],
    notes: [
      ["Cut", "Throat-clearing opener"],
      ["Cut", "Inflated praise"],
      ["Kept", "Figures and citation, verbatim"],
    ],
  },
  {
    mode: "Concise",
    segments: [
      ["strike", OPENER],
      ["plain", "Q3 "],
      ["strike", "performance was truly remarkable, with revenue increasing by"],
      ["insert", "revenue rose"],
      ["plain", " "],
      ...FIGURES,
      ["plain", "."],
      ["strike", ` ${CLOSER}`],
    ],
    notes: [
      ["Cut", "Everything but the result"],
      ["Changed", "Two sentences into one"],
      ["Kept", "Figures and citation, verbatim"],
    ],
  },
  {
    mode: "Casual",
    segments: [
      ["strike", OPENER],
      ["plain", "Q3 "],
      ["strike", "performance was truly remarkable, with revenue increasing by"],
      ["insert", "was a great quarter. Revenue jumped"],
      ["plain", " "],
      ...FIGURES,
      ["plain", ". "],
      ["strike", CLOSER],
      ["insert", "Nice work, team."],
    ],
    notes: [
      ["Changed", "Report voice into spoken voice"],
      ["Cut", "Inflated praise"],
      ["Kept", "Figures and citation, verbatim"],
    ],
  },
  {
    mode: "Persuasive",
    segments: [
      ["strike", OPENER],
      ["plain", "Q3 "],
      ["strike", "performance was truly remarkable, with revenue increasing by"],
      ["insert", "proved the strategy works: revenue rose"],
      ["plain", " "],
      ...FIGURES,
      ["plain", ". "],
      ["strike", CLOSER],
      ["insert", "That’s the team’s work, and it’s a base to build on."],
    ],
    notes: [
      ["Changed", "Praise into an argument"],
      ["Cut", "Throat-clearing opener"],
      ["Kept", "Figures and citation, verbatim"],
    ],
  },
];

/** The draft as written: everything except insertions. */
export function draftText(segments: Segment[]) {
  return segments
    .filter(([kind]) => kind !== "insert")
    .map(([, text]) => text)
    .join("");
}

/** The edited result: everything except cuts. */
export function cleanText(segments: Segment[]) {
  return segments
    .filter(([kind]) => kind !== "strike")
    .map(([, text]) => text)
    .join("");
}

export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function keptFigures(segments: Segment[]) {
  return segments.filter(([kind]) => kind === "keep").length;
}
