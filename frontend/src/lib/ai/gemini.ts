import type { z } from "zod";

/**
 * Shared Gemini call for the AI Tools (Grammar, Paraphrase, Summarize,
 * Quiz, Fact check). Same model and request shape as humanize.ts,
 * study.ts and detector.ts; those predate this helper and keep their
 * own copies. Every structured response is validated with Zod before it
 * goes anywhere: model output is never trusted structurally.
 */

const MODEL = "gemini-3.6-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export class ToolError extends Error {
  constructor(
    message: string,
    public readonly code: "config" | "upstream" | "quota" | "invalid_output"
  ) {
    super(message);
    this.name = "ToolError";
  }
}

export interface GroundingSource {
  title: string;
  url: string;
}

interface GeminiCall {
  prompt: string;
  temperature: number;
  maxOutputTokens: number;
  /** Gemini responseSchema (OpenAPI subset). Omit for free text. */
  responseSchema?: object;
  /** Ground the answer in live Google Search results (Fact check). */
  googleSearch?: boolean;
}

interface GeminiResult {
  text: string;
  sources: GroundingSource[];
}

// Gemini 3 models "think" before answering, and those thinking tokens
// count against maxOutputTokens. Left at the default, thinking alone
// can use up a small budget and cut the JSON off mid-object. These tools
// are well-specified tasks, so thinking is held at "low" and the budget
// gets fixed headroom on top of the expected answer length.
const THINKING_HEADROOM = 1024;
const RETRY_DELAYS_MS = [1200, 3000];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function requestGemini(apiKey: string, body: string) {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`${API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    // 500/503 are Google's "temporarily overloaded" answers: worth a
    // couple of quick retries before telling the user to try again.
    if ((response.status === 503 || response.status === 500) && attempt < RETRY_DELAYS_MS.length) {
      await wait(RETRY_DELAYS_MS[attempt]);
      continue;
    }
    return response;
  }
}

async function callGemini(call: GeminiCall): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new ToolError("GEMINI_API_KEY is not configured.", "config");

  const generationConfig: Record<string, unknown> = {
    temperature: call.temperature,
    maxOutputTokens: call.maxOutputTokens + THINKING_HEADROOM,
    thinkingConfig: { thinkingLevel: "low" },
  };
  if (call.responseSchema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = call.responseSchema;
  }

  const response = await requestGemini(
    apiKey,
    JSON.stringify({
      contents: [{ parts: [{ text: call.prompt }] }],
      generationConfig,
      ...(call.googleSearch ? { tools: [{ google_search: {} }] } : {}),
    })
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("[tools] Gemini API error", response.status, body.slice(0, 500));
    const quotaExhausted = response.status === 429 && /quota/i.test(body);
    throw new ToolError(
      quotaExhausted
        ? "Humanora's AI capacity is used up for the moment. Please try again later."
        : response.status === 429 || response.status >= 500
          ? "The AI service is busy right now. Please try again in a minute."
          : "This tool is temporarily unavailable. Please try again shortly.",
      quotaExhausted ? "quota" : "upstream"
    );
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];
  if (candidate?.finishReason === "MAX_TOKENS") {
    throw new ToolError("That text needs a longer result than this tool can return in one go. Try a shorter passage.", "invalid_output");
  }
  const text: string = (candidate?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? "")
    .join("")
    .trim();
  if (!text) throw new ToolError("The AI service returned an empty result. Please try again.", "invalid_output");

  const sources: GroundingSource[] = [];
  const seen = new Set<string>();
  for (const chunk of candidate?.groundingMetadata?.groundingChunks ?? []) {
    const url: string | undefined = chunk?.web?.uri;
    if (url && !seen.has(url)) {
      seen.add(url);
      sources.push({ url, title: chunk.web.title || new URL(url).hostname });
    }
  }
  return { text, sources };
}

/**
 * Pull a JSON object out of model text. Structured-output mode returns
 * bare JSON; search-grounded calls can't use responseSchema, so their
 * JSON may arrive inside a ```json fence or with a sentence around it.
 */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) throw new ToolError("The AI service returned an unreadable result. Please try again.", "invalid_output");
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    throw new ToolError("The AI service returned an unreadable result. Please try again.", "invalid_output");
  }
}

export async function generateStructured<T>(
  call: GeminiCall,
  schema: z.ZodType<T>
): Promise<{ data: T; sources: GroundingSource[] }> {
  const { text, sources } = await callGemini(call);
  const parsed = schema.safeParse(extractJson(text));
  if (!parsed.success) {
    console.error("[tools] output failed validation", parsed.error.issues.slice(0, 3));
    throw new ToolError("The AI service returned an unexpected result. Please try again.", "invalid_output");
  }
  return { data: parsed.data, sources };
}

/** Output budget scaled to input length, capped by the plan's ceiling
 * (same approach as humanize.ts's estimateMaxOutputTokens). */
export function outputBudget(inputText: string, ceiling: number, factor = 1.3, floor = 400) {
  const estimatedInputTokens = Math.ceil(inputText.length / 4);
  return Math.min(ceiling, Math.max(floor, Math.round(estimatedInputTokens * factor) + 300));
}
