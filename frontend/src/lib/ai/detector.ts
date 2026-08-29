import { z } from "zod";

/**
 * HUMANORA's AI Detector — a genuinely different kind of output than
 * Humanize/Study: those PRODUCE text; this ASSESSES text someone else
 * (or another tool) produced. Deliberately does NOT return a bare
 * percentage ("98% human") — AI-text detection is fundamentally
 * probabilistic pattern-matching, not a measurement, and a false sense
 * of precision is actively misleading. Instead: a categorical
 * likelihood band, an explicit confidence level, the specific signals
 * that informed the assessment (both AI-leaning and human-leaning —
 * real writing usually has both), and a plain-English explanation that
 * always states the method can't prove authorship.
 *
 * Uses the same structured-output mechanism as voiceAnalysis.ts
 * (responseSchema + Zod validation of whatever comes back) — never
 * trust model output structurally before it reaches the database or the
 * client.
 */

export const detectorLikelihoodEnum = ["likely_human", "mixed_uncertain", "likely_ai_assisted"] as const;
export type DetectorLikelihood = (typeof detectorLikelihoodEnum)[number];

export const detectorConfidenceEnum = ["low", "medium", "high"] as const;
export type DetectorConfidence = (typeof detectorConfidenceEnum)[number];

export const LIKELIHOOD_LABEL: Record<DetectorLikelihood, string> = {
  likely_human: "Likely human-written",
  mixed_uncertain: "Mixed or uncertain",
  likely_ai_assisted: "Likely AI-generated or AI-assisted",
};

export const detectorResultSchema = z.object({
  likelihood: z.enum(detectorLikelihoodEnum),
  confidence: z.enum(detectorConfidenceEnum),
  // Specific, observed patterns — never generic filler like "the
  // writing feels unnatural." Capped short so this stays scannable.
  aiSignals: z.array(z.string().max(140)).max(5),
  humanSignals: z.array(z.string().max(140)).max(5),
  explanation: z.string().max(500),
});

export type DetectorResult = z.infer<typeof detectorResultSchema>;

export class DetectorError extends Error {
  constructor(message: string, public readonly code: "config" | "upstream" | "invalid_output") {
    super(message);
    this.name = "DetectorError";
  }
}

const MODEL = "gemini-3.6-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    likelihood: { type: "STRING", enum: [...detectorLikelihoodEnum] },
    confidence: { type: "STRING", enum: [...detectorConfidenceEnum] },
    aiSignals: { type: "ARRAY", items: { type: "STRING" }, maxItems: 5 },
    humanSignals: { type: "ARRAY", items: { type: "STRING" }, maxItems: 5 },
    explanation: { type: "STRING" },
  },
  required: ["likelihood", "confidence", "aiSignals", "humanSignals", "explanation"],
} as const;

function buildPrompt(text: string): string {
  return [
    "You are analyzing a piece of writing to assess whether it shows patterns typical of AI-generated or AI-assisted text, versus patterns typical of unedited human writing.",
    "",
    "This is inherently probabilistic pattern-matching, NOT proof of authorship — you cannot know for certain how a text was produced, and skilled AI-assisted editing can closely resemble human writing while genuine human writing can occasionally look uniform or generic. Reflect that honesty in your `confidence` field: use \"low\" liberally whenever the text is short, ambiguous, or doesn't show clear signals either way. Never claim certainty.",
    "",
    "Look for concrete signals, not vibes — things like: unusually uniform sentence length/rhythm, generic transitional phrasing, absence of specific personal detail or idiosyncrasy, overly balanced/hedged phrasing (AI-leaning); versus irregular rhythm, distinctive word choice, small inconsistencies or informalities, concrete specific detail, unconventional structure (human-leaning). List the SPECIFIC signals you actually observed in THIS text, not a generic checklist.",
    "",
    "Return ONLY a JSON object matching the required schema. `explanation` should be 2-4 plain-English sentences a non-technical person can follow, and must not overstate certainty.",
    "",
    "--- Text to analyze ---",
    text,
  ].join("\n");
}

export async function analyzeForAiPatterns(text: string): Promise<DetectorResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new DetectorError("GEMINI_API_KEY is not configured.", "config");
  }

  const response = await fetch(`${API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(text) }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("[detector] Gemini API error", response.status, body);
    throw new DetectorError("The analysis service is temporarily unavailable.", "upstream");
  }

  const data = await response.json();
  const raw: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) {
    throw new DetectorError("The AI provider returned an empty analysis.", "invalid_output");
  }

  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("[detector] failed to parse model output:", raw.slice(0, 500));
    throw new DetectorError("The AI provider returned malformed analysis output.", "invalid_output");
  }

  const result = detectorResultSchema.safeParse(parsed);
  if (!result.success) {
    console.error("[detector] schema validation failed", result.error.flatten());
    throw new DetectorError("The AI provider's analysis didn't match the expected format.", "invalid_output");
  }
  return result.data;
}
