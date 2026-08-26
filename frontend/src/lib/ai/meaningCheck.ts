/**
 * Deterministic meaning-preservation check — NOT another AI call. Runs
 * plain pattern matching against the original input and HUMANORA's own
 * output to flag the facts a rewrite must never silently change:
 * numbers, percentages, dates, URLs, and quoted text. This is a safety
 * net on top of the prompt's own "preserve meaning" instruction
 * (lib/ai/humanize.ts) — the model can occasionally still drop a
 * figure or mangle a URL, and a user should be able to see that at a
 * glance rather than trust it silently.
 *
 * Deliberately conservative: it only ever flags items extracted from
 * the ORIGINAL text that don't show up (in a normalized form) in the
 * output — it never blocks or fails a request, just informs.
 */

export type MeaningItemType = "number" | "percentage" | "date" | "url" | "quote";

export interface MeaningItem {
  type: MeaningItemType;
  value: string;
  preserved: boolean;
}

export interface MeaningCheckResult {
  items: MeaningItem[];
  allPreserved: boolean;
}

const URL_RE = /\bhttps?:\/\/[^\s<>"')\]]+/gi;
const PERCENTAGE_RE = /\b\d[\d,]*(?:\.\d+)?\s?%/g;
const NUMBER_RE = /\b\d[\d,]*(?:\.\d+)?\b/g;
const MONTH = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const DATE_TEXTUAL_RE = new RegExp(`\\b${MONTH}\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+\\d{4}\\b`, "gi");
const DATE_NUMERIC_RE = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/g;
const QUOTE_RE = /"([^"\n]{4,120})"/g;

function normalizeNumberLike(s: string): string {
  return s.replace(/,/g, "").trim().toLowerCase();
}

function includesNormalized(haystack: string, needle: string): boolean {
  const normHaystack = haystack.replace(/,/g, "").toLowerCase();
  const normNeedle = normalizeNumberLike(needle);
  return normHaystack.includes(normNeedle);
}

function extractUnique(re: RegExp, text: string): string[] {
  const matches = text.match(re) ?? [];
  return Array.from(new Set(matches.map((m) => m.trim())));
}

/**
 * Deliberately checks percentages/dates/URLs before plain numbers, and
 * removes each match's characters from a working copy before running
 * the plain-number pass — a percentage or date already contains digits
 * that would otherwise also be reported as a separate, redundant
 * "number" item.
 */
export function checkMeaningPreservation(input: string, output: string): MeaningCheckResult {
  const items: MeaningItem[] = [];
  let remaining = input;

  const urls = extractUnique(URL_RE, remaining);
  for (const url of urls) items.push({ type: "url", value: url, preserved: output.includes(url) });
  remaining = remaining.replace(URL_RE, " ");

  const percentages = extractUnique(PERCENTAGE_RE, remaining);
  for (const pct of percentages) items.push({ type: "percentage", value: pct, preserved: includesNormalized(output, pct) });
  remaining = remaining.replace(PERCENTAGE_RE, " ");

  const textualDates = extractUnique(DATE_TEXTUAL_RE, remaining);
  for (const date of textualDates) items.push({ type: "date", value: date, preserved: output.toLowerCase().includes(date.toLowerCase()) });
  remaining = remaining.replace(DATE_TEXTUAL_RE, " ");

  const numericDates = extractUnique(DATE_NUMERIC_RE, remaining);
  for (const date of numericDates) items.push({ type: "date", value: date, preserved: output.includes(date) });
  remaining = remaining.replace(DATE_NUMERIC_RE, " ");

  const quotes = extractUnique(QUOTE_RE, input); // quotes checked against the ORIGINAL (unmodified) text
  for (const q of quotes) items.push({ type: "quote", value: q, preserved: output.includes(q) });

  const numbers = extractUnique(NUMBER_RE, remaining);
  for (const num of numbers) items.push({ type: "number", value: num, preserved: includesNormalized(output, num) });

  return { items, allPreserved: items.every((i) => i.preserved) };
}
