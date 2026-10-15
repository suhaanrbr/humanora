/**
 * The "tells" checker behind the homepage's live demo. Deterministic and
 * client-side by design: no model call, no network, so anonymous
 * visitors can use it freely (Humanora's AI features all require an
 * account) and nothing a visitor pastes ever leaves their browser.
 *
 * It flags the surface patterns readers associate with machine-drafted
 * prose. It is NOT an AI detector and must never be presented as one —
 * plenty of human writing trips these too. The point is to show a
 * writer what an editor would mark.
 */

export type TellKind = "filler" | "inflated" | "hedge" | "triplet";

export interface TellMatch {
  kind: TellKind;
  start: number;
  end: number;
  text: string;
}

export interface TellsReport {
  matches: TellMatch[];
  counts: Record<TellKind, number>;
  words: number;
  sentenceLengths: number[];
  /** True when there are enough sentences and their lengths barely vary. */
  uniformRhythm: boolean;
}

export const TELL_LABELS: Record<TellKind, { name: string; hint: string }> = {
  filler: { name: "Throat-clearing", hint: "Words before the point." },
  inflated: { name: "Borrowed grandeur", hint: "Sounds like writing, says little." },
  hedge: { name: "Hedging", hint: "Commits to nothing." },
  triplet: { name: "Reflex triplet", hint: "Three of everything." },
};

const FILLER = [
  "it is important to note that",
  "it's important to note that",
  "it is worth noting that",
  "it's worth noting that",
  "it should be noted that",
  "it goes without saying that",
  "needless to say",
  "in today's fast-paced",
  "in today's digital",
  "in today's rapidly evolving",
  "in today's ever-changing",
  "in the ever-evolving",
  "in the realm of",
  "when it comes to",
  "at the end of the day",
  "in conclusion",
  "in summary",
  "first and foremost",
  "plays a crucial role in",
  "plays a pivotal role in",
  "plays a vital role in",
  "a wide range of",
  "a wide variety of",
  "serves as a testament to",
  "is a testament to",
  "due to the fact that",
  "in order to",
  "with that being said",
  "that being said",
  "let's dive in",
  "let's delve into",
];

const INFLATED = [
  "delve",
  "delves",
  "delving",
  "tapestry",
  "testament",
  "leverage",
  "leveraging",
  "seamless",
  "seamlessly",
  "robust",
  "pivotal",
  "multifaceted",
  "landscape",
  "embark",
  "foster",
  "fostering",
  "unlock",
  "unlocking",
  "elevate",
  "elevating",
  "harness",
  "harnessing",
  "paramount",
  "myriad",
  "intricate",
  "meticulous",
  "meticulously",
  "underscore",
  "underscores",
  "groundbreaking",
  "transformative",
  "game-changer",
  "game-changing",
  "cutting-edge",
  "synergy",
  "holistic",
  "unwavering",
  "invaluable",
  "bustling",
  "vibrant",
  "realm",
];

const HEDGES = [
  "could potentially",
  "may potentially",
  "might potentially",
  "it could be argued that",
  "it can be argued that",
  "to some extent",
  "a variety of factors",
  "various factors",
  "a number of factors",
  "depends on a variety of",
  "depends on various",
  "in many ways",
  "generally speaking",
];

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Curly and straight apostrophes are interchangeable in pasted text.
function phrasePattern(phrases: string[]) {
  const alternatives = phrases
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((p) => escapeRegExp(p).replace(/'/g, "['’]").replace(/ /g, "\\s+"));
  return new RegExp(`\\b(?:${alternatives.join("|")})\\b`, "gi");
}

const FILLER_RE = phrasePattern(FILLER);
const INFLATED_RE = phrasePattern(INFLATED);
const HEDGE_RE = phrasePattern(HEDGES);
// "clear, concise, and compelling": three single words, comma-separated,
// the last joined by "and"/"or" (Oxford comma optional).
const TRIPLET_RE = /\b[A-Za-z][\w-]*,\s+[A-Za-z][\w-]*,?\s+(?:and|or)\s+[A-Za-z][\w-]*\b/g;

function collect(re: RegExp, kind: TellKind, text: string, out: TellMatch[]) {
  re.lastIndex = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    out.push({ kind, start: m.index, end: m.index + m[0].length, text: m[0] });
  }
}

/** Drop any match that overlaps one already kept (earlier, then longer, wins). */
function removeOverlaps(matches: TellMatch[]) {
  const sorted = matches.slice().sort((a, b) => a.start - b.start || b.end - a.end);
  const kept: TellMatch[] = [];
  let lastEnd = -1;
  for (const m of sorted) {
    if (m.start >= lastEnd) {
      kept.push(m);
      lastEnd = m.end;
    }
  }
  return kept;
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=["“'‘(]?[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => /\w/.test(s));
}

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function analyzeTells(text: string): TellsReport {
  const raw: TellMatch[] = [];
  collect(FILLER_RE, "filler", text, raw);
  collect(HEDGE_RE, "hedge", text, raw);
  collect(INFLATED_RE, "inflated", text, raw);
  collect(TRIPLET_RE, "triplet", text, raw);
  const matches = removeOverlaps(raw);

  const counts: Record<TellKind, number> = { filler: 0, inflated: 0, hedge: 0, triplet: 0 };
  for (const m of matches) counts[m.kind] += 1;

  const sentenceLengths = splitSentences(text).map(countWords);
  let uniformRhythm = false;
  if (sentenceLengths.length >= 4) {
    const mean = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((a, b) => a + (b - mean) ** 2, 0) / sentenceLengths.length;
    uniformRhythm = mean > 0 && Math.sqrt(variance) / mean < 0.25;
  }

  return { matches, counts, words: countWords(text), sentenceLengths, uniformRhythm };
}
