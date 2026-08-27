/**
 * HUMANORA's Study tools — Summarize, Explain, and Study Notes. Shares
 * the exact same Gemini call shape, quota system, and cost-control
 * approach as lib/ai/humanize.ts (see that file's header comment) —
 * this is a second capability on the SAME AI pipeline, not a separate
 * product. Deliberately kept in its own file rather than folded into
 * humanize.ts: the prompts, grounding rules, and modes are genuinely
 * different tasks, and mixing them would make both harder to reason
 * about.
 *
 * Grounding discipline (all three modes): every prompt explicitly
 * instructs the model to stay grounded in the SUPPLIED text and to say
 * so when the material doesn't contain enough information, rather than
 * inventing facts — this matters far more here than for Humanize, since
 * a summary or study notes that quietly fabricates content is actively
 * harmful to a student relying on it to study from.
 */

export type StudyMode = "summarize" | "explain" | "notes";
export type ExplainDepth = "simple" | "standard" | "detailed";

export interface StudyRequest {
  text: string;
  mode: StudyMode;
  /** Only meaningful for mode "explain"; ignored otherwise. */
  depth?: ExplainDepth;
  /** Ceiling for this call's maxOutputTokens — plan-derived, never
   * client-supplied. Same mechanism as HumanizeRequest.outputTokenLimit. */
  outputTokenLimit: number;
}

export interface StudyResult {
  output: string;
}

export class StudyError extends Error {
  constructor(message: string, public readonly code: "config" | "upstream" | "empty_output") {
    super(message);
    this.name = "StudyError";
  }
}

const MODEL = "gemini-3.6-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const GROUNDING_RULE =
  "Base your response only on the material provided below. Do not invent facts, figures, names, or claims that aren't in it. If the material doesn't contain enough information for a complete response, say so plainly instead of filling the gap with invented content. You may use general knowledge only to explain or clarify a concept that IS present in the material — never to introduce new claims about it.";

const depthInstructions: Record<ExplainDepth, string> = {
  simple: "Explain it simply, as you would to someone encountering the topic for the first time. Short sentences, plain language, no jargon.",
  standard: "Explain it at a normal study level — clear and complete, assuming basic familiarity with the subject.",
  detailed: "Explain it in depth — cover nuance, mechanism, and important exceptions or edge cases, suitable for exam-level understanding.",
};

function buildPrompt(req: StudyRequest): string {
  const lines: string[] = [];

  if (req.mode === "summarize") {
    lines.push(
      "You are HUMANORA's study assistant. Summarize the material below for a student who needs to review it quickly.",
      "",
      GROUNDING_RULE,
      "",
      "Output exactly two sections, in this order, with these exact headers:",
      "Summary:",
      "(a short paragraph, 3-5 sentences)",
      "",
      "Key Points:",
      "(a bulleted list, each line starting with \"- \")",
      "",
      "Do not add any other headers, commentary, or notes."
    );
  } else if (req.mode === "explain") {
    const depth = req.depth ?? "standard";
    lines.push(
      "You are HUMANORA's study assistant. Explain the material below for a student.",
      "",
      GROUNDING_RULE,
      "",
      `Depth: ${depth} — ${depthInstructions[depth]}`,
      "",
      "Output only the explanation itself — no headers, no restating these instructions, no commentary."
    );
  } else {
    lines.push(
      "You are HUMANORA's study assistant. Turn the material below into structured revision notes.",
      "",
      GROUNDING_RULE,
      "",
      "Output exactly these sections, in this order, with these exact headers (omit a section only if the material genuinely gives you nothing for it):",
      "Key Concepts:",
      "(a bulleted list of the core ideas, each line starting with \"- \")",
      "",
      "Definitions:",
      "(term: definition, one per line, only for terms actually defined or clearly used in the material)",
      "",
      "Important Points:",
      "(a bulleted list of details worth remembering, each line starting with \"- \")",
      "",
      "Exam Reminders:",
      "(a short bulleted list of easy-to-miss details or common mix-ups, only if the material supports this — otherwise write \"None identified.\")",
      "",
      "Do not add any other headers or commentary."
    );
  }

  lines.push("", "Material:", req.text);
  return lines.join("\n");
}

/** Mirrors humanize.ts's estimateMaxOutputTokens — see that file for the
 * full reasoning. Study outputs are structured (headers, bullets) so
 * they run a bit longer relative to input than a plain rewrite. */
function estimateMaxOutputTokens(inputText: string, ceiling: number): number {
  const estimatedInputTokens = Math.ceil(inputText.length / 4);
  const estimated = Math.round(estimatedInputTokens * 1.3) + 250;
  return Math.min(ceiling, Math.max(300, estimated));
}

export async function generateStudyOutput(req: StudyRequest): Promise<StudyResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new StudyError("GEMINI_API_KEY is not configured.", "config");
  }

  const maxOutputTokens = estimateMaxOutputTokens(req.text, req.outputTokenLimit);
  const response = await fetch(`${API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(req) }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("[study] Gemini API error", response.status, body);
    throw new StudyError(
      response.status === 429
        ? "The AI provider's free-tier quota was reached. Please try again shortly."
        : "The study service is temporarily unavailable.",
      "upstream"
    );
  }

  const data = await response.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  const output = text?.trim() ?? "";

  if (!output) {
    throw new StudyError("The AI provider returned an empty result.", "empty_output");
  }

  return { output };
}
