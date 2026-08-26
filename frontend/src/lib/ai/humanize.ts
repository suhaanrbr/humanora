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
}

export interface HumanizeResult {
  output: string;
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

function buildPrompt(req: HumanizeRequest): string {
  return [
    "You are HUMANORA, a writing assistant that rewrites AI-assisted or stiff drafts into more natural, human-sounding writing.",
    "",
    "Rules:",
    "- Preserve the original meaning, facts, numbers, dates, names, quotations, and citations exactly.",
    "- Do not add information that wasn't in the original text.",
    "- Do not add commentary, explanations, or notes — output ONLY the rewritten text.",
    "- Do not wrap the output in quotes or markdown.",
    "",
    `Mode: ${req.mode} — ${modeInstructions[req.mode]}`,
    `Strength: ${req.strength} — ${strengthInstructions[req.strength]}`,
    ...(req.styleDirectives
      ? ["", `Match the writer's own voice as closely as the mode/strength above allow: ${req.styleDirectives}`]
      : []),
    "",
    "Original text:",
    req.text,
  ].join("\n");
}

export async function humanize(req: HumanizeRequest): Promise<HumanizeResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new HumanizeError(
      "GEMINI_API_KEY is not configured.",
      "config"
    );
  }

  const response = await fetch(`${API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(req) }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1024,
      },
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
  const output: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!output || !output.trim()) {
    throw new HumanizeError(
      "The AI provider returned an empty result.",
      "empty_output"
    );
  }

  return { output: output.trim() };
}
