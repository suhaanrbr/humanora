/**
 * Deterministic readability scoring — the classic Flesch Reading Ease
 * formula. No AI call, no cost; pure arithmetic over the text HUMANORA
 * already has. Shown alongside a rewrite so a user can see the effect
 * of a Mode/Strength choice numerically, not just by eye.
 */

export interface ReadabilityScore {
  score: number; // 0-100, higher = easier to read
  label: "Very easy" | "Easy" | "Standard" | "Fairly difficult" | "Difficult" | "Very difficult";
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  const matches = w.match(/[aeiouy]+/g);
  let count = matches ? matches.length : 1;
  if (w.endsWith("e") && count > 1) count -= 1;
  return Math.max(count, 1);
}

export function scoreReadability(text: string): ReadabilityScore | null {
  const sentences = text.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter(Boolean);
  if (sentences.length === 0 || words.length === 0) return null;

  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const wordsPerSentence = words.length / sentences.length;
  const syllablesPerWord = syllables / words.length;

  const raw = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  let label: ReadabilityScore["label"];
  if (score >= 90) label = "Very easy";
  else if (score >= 70) label = "Easy";
  else if (score >= 50) label = "Standard";
  else if (score >= 30) label = "Fairly difficult";
  else if (score >= 10) label = "Difficult";
  else label = "Very difficult";

  return { score, label };
}
