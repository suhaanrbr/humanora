/**
 * HUMANORA's AI provider abstraction.
 *
 * This is the ONE place that knows which AI vendor HUMANORA uses. Every
 * caller (API routes, future background jobs) goes through `humanize()`
 * below and never imports a vendor SDK directly — swapping providers,
 * or routing different plans to different models, means changing this
 * file only.
 *
 * Currently implemented against Google's Gemini API (free tier to
 * start, see HUMANORA_SPEC.md cost rule).
 *
 * IMPORTANT: only ever import this from a Route Handler (app/api/**\/
 * route.ts) or other server-only code. Never import it from a "use
 * client" component — the API key it reads must never reach the browser.
 */

export type WritingMode =
  | "natural"
  | "academic"
  | "professional"
  | "concise"
  | "casual"
  | "persuasive";

export type RewriteStrength = "light" | "balanced" | "strong";

export interface HumanizeRequest {
  text: string;
  mode: WritingMode;
  strength: RewriteStrength;
  /** Optional short style directives from the caller's My Voice profile
   * (see lib/ai/voiceAnalysis.ts#buildStyleDirectives) — never raw
   * sample text. Omit for the plain, voice-agnostic rewrite. */
  styleDirectives?: string;
  /** A free-text steering instruction from the user (e.g. "avoid em
   * dashes", "keep it under 100 words", "use British spelling") —
   * genuinely appended to the prompt, gated server-side to plans with
   * PLANS[plan].customInstructions (see api/humanize/route.ts). Never
   * allowed to override the meaning/formatting-preservation rules
   * below — it's appended as an additional preference, not a
   * system-level override. */
  customInstructions?: string;
  /** How many independent rewrite candidates to request (default 1) —
   * driven by the caller's plan (PLANS[plan].outputVariations), never a
   * client-supplied number. Made as SEPARATE sequential requests, not
   * via Gemini's candidateCount — gemini-3.6-flash rejects
   * candidateCount > 1 outright ("Multiple candidates is not enabled
   * for this model"), discovered when this first shipped. Costs more
   * AI-provider requests proportional to `variations`, which is the
   * honest tradeoff for a real multi-output feature on this model. */
  variations?: number;
  /** Ceiling for this call's `maxOutputTokens` — driven by the caller's
   * plan (PLANS[plan].outputTokenLimit), never client-supplied. The
   * actual per-call value is scaled down from this based on input
   * length (see estimateMaxOutputTokens below); this is only the upper
   * bound, sized so a plan's longest permitted input isn't truncated.
   * Defaults to 1024 (the previous flat ceiling) if omitted, so any
   * future caller that doesn't pass a plan-derived value degrades to
   * the old, safe-but-unoptimized behavior rather than an error. */
  outputTokenLimit?: number;
}

/**
 * Scales the actual per-call output ceiling to what a rewrite of this
 * length plausibly needs, instead of always requesting the plan's full
 * ceiling — most requests are far short of their plan's max input
 * length, so most calls should cost proportionally less, not spend the
 * same worst-case output budget every time. Never exceeds `ceiling`
 * (the plan's outputTokenLimit), and never goes below a floor generous
 * enough for a short rewrite to complete. See docs/AI_COST_MODEL.md.
 */
function estimateMaxOutputTokens(inputText: string, ceiling: number): number {
  const estimatedInputTokens = Math.ceil(inputText.length / 4);
  const estimated = Math.round(estimatedInputTokens * 1.8) + 150;
  return Math.min(ceiling, Math.max(200, estimated));
}

export interface HumanizeResult {
  /** The first candidate — kept for every existing caller that only
   * expects one result; always equal to outputs[0]. */
  output: string;
  /** All distinct candidates actually produced (length >= 1, and <=
   * the requested `variations` — a later request can return text
   * identical to an earlier one, which is de-duplicated here). */
  outputs: string[];
}

export class HumanizeError extends Error {
  constructor(
    message: string,
    public readonly code: "config" | "upstream" | "empty_output"
  ) {
    super(message);
    this.name = "HumanizeError";
  }
}

const MODEL = "gemini-3.6-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const modeInstructions: Record<WritingMode, string> = {
  natural: "Fluid, everyday writing without unnecessary polish.",
  academic: "Structured, precise writing appropriate for academic contexts.",
  professional: "Clear, workplace-appropriate business communication.",
  concise: "Remove unnecessary wording while preserving the original meaning.",
  casual: "Relaxed, conversational writing.",
  persuasive: "Stronger argument structure while preserving the original intent.",
};

const strengthInstructions: Record<RewriteStrength, string> = {
  light: "Make only light touch-ups — preserve sentence structure closely.",
  balanced: "Rewrite naturally, balancing closeness to the original with fluency.",
  strong: "Rewrite more freely for maximum naturalness, while preserving meaning.",
};

function buildPrompt(req: HumanizeRequest, variationIndex: number): string {
  return [
    "You are HUMANORA, a writing assistant that rewrites AI-assisted or stiff drafts into more natural, human-sounding writing.",
    "",
    "Rules:",
    "- Preserve the original meaning, facts, numbers, dates, names, quotations, and citations exactly.",
    "- Preserve the original structure: keep paragraph breaks, bullet/numbered lists, and headings in the same places and format — rewrite the wording within each, never merge or reorder them.",
    "- Do not add information that wasn't in the original text.",
    "- Do not add commentary, explanations, or notes — output ONLY the rewritten text.",
    "- Do not wrap the output in quotes or markdown.",
    "",
    `Mode: ${req.mode} — ${modeInstructions[req.mode]}`,
    `Strength: ${req.strength} — ${strengthInstructions[req.strength]}`,
    ...(req.styleDirectives
      ? ["", `Match the writer's own voice as closely as the mode/strength above allow: ${req.styleDirectives}`]
      : []),
    ...(req.customInstructions
      ? ["", `Additional preference from the user (follow it unless it conflicts with the rules above): ${req.customInstructions}`]
      : []),
    ...(variationIndex > 0
      ? ["", `Produce a genuinely different phrasing from a typical rewrite — vary sentence structure and word choice, while following every rule above.`]
      : []),
    "",
    "Original text:",
    req.text,
  ].join("\n");
}

async function requestOneCandidate(req: HumanizeRequest, apiKey: string, variationIndex: number, temperature: number): Promise<string> {
  const maxOutputTokens = estimateMaxOutputTokens(req.text, req.outputTokenLimit ?? 1024);
  const response = await fetch(`${API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(req, variationIndex) }] }],
      generationConfig: { temperature, maxOutputTokens },
    }),
  });

  if (!response.ok) {
    // Never leak upstream response bodies (may contain request echoes)
    // to the client — log server-side only, return a generic error.
    const body = await response.text().catch(() => "");
    console.error("[humanize] Gemini API error", response.status, body);
    throw new HumanizeError(
      response.status === 429
        ? "The AI provider's free-tier quota was reached. Please try again shortly."
        : "The humanization service is temporarily unavailable.",
      "upstream"
    );
  }

  const data = await response.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text?.trim() ?? "";
}

export async function humanize(req: HumanizeRequest): Promise<HumanizeResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new HumanizeError("GEMINI_API_KEY is not configured.", "config");
  }

  const variationCount = Math.min(Math.max(req.variations ?? 1, 1), 5);

  // First candidate uses the same temperature as before (unchanged
  // behavior for every plan that only ever requested one variation).
  // Additional candidates run sequentially (not in parallel) to stay
  // within the free-tier per-minute rate limit for a single request,
  // and use a slightly higher temperature + an explicit "vary this"
  // instruction so they're not near-duplicates of the first.
  const outputs: string[] = [];
  for (let i = 0; i < variationCount; i++) {
    const temperature = i === 0 ? 0.6 : 0.85;
    try {
      const text = await requestOneCandidate(req, apiKey, i, temperature);
      if (text) outputs.push(text);
    } catch (err) {
      // The FIRST candidate failing is a real failure (matches every
      // existing single-variation caller's behavior exactly). A later
      // variation failing (rate limit, transient upstream hiccup)
      // shouldn't cost the user the successful result(s) they already
      // got — skip it and keep going.
      if (i === 0) throw err;
      console.error(`[humanize] variation ${i + 1}/${variationCount} failed, continuing with fewer`, err);
    }
  }

  const unique = Array.from(new Set(outputs));

  if (unique.length === 0) {
    throw new HumanizeError("The AI provider returned an empty result.", "empty_output");
  }

  return { output: unique[0], outputs: unique };
}
