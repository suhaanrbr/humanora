import { NextRequest, NextResponse } from "next/server";
import { ToolError } from "@/lib/ai/gemini";
import {
  TOOL_LIMITS,
  isAiToolId,
  runFactCheck,
  runGrammar,
  runParaphrase,
  runQuiz,
  runSummarize,
  toolOptionsSchema,
  type AiToolId,
} from "@/lib/ai/tools";
import { checkRateLimit } from "@/lib/ai/rateLimit";
import { getUserPlan } from "@/lib/db/entitlement";
import { checkAndReserveQuota, releaseQuotaUnit } from "@/lib/db/usage";
import { PLANS } from "@/lib/config/plans";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

// One route for every AI Tool, with the same guard rails as /api/detector:
// signed in, a paid plan, a per-user burst limit, and the shared monthly
// word allowance reserved BEFORE the model is called (and released if
// the call fails).
const BURST_LIMIT = { requests: 20, windowMs: 60 * 1000 };

// A search-grounded fact check plus a retry can take a while; give the
// function room rather than letting the platform default cut it off.
export const maxDuration = 60;

// Search-grounded fact checks cost noticeably more per call than a plain
// generation, so they draw double from the word allowance.
const ALLOWANCE_MULTIPLIER: Partial<Record<AiToolId, number>> = { "fact-check": 2 };

// Tools return structured output (three paraphrase versions, a whole
// quiz), so they get a floor above Essential's rewrite-sized ceiling.
const MIN_OUTPUT_TOKENS = 4096;

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function POST(req: NextRequest, { params }: RouteContext<"/api/tools/[tool]">) {
  const { tool } = await params;
  if (!isAiToolId(tool)) return NextResponse.json({ error: "Unknown tool." }, { status: 404 });

  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);
  const userId = auth.userId;

  const burst = checkRateLimit(`tools-burst:${userId}`, BURST_LIMIT.requests, BURST_LIMIT.windowMs);
  if (!burst.allowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = ((await req.json()) ?? {}) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const limits = TOOL_LIMITS[tool];
  if (text.length < limits.min) {
    return NextResponse.json(
      { error: `Please provide at least ${limits.min} characters so there's enough to work with.` },
      { status: 400 }
    );
  }
  if (text.length > limits.max) {
    return NextResponse.json(
      { error: `That's too long for this tool (max about ${Math.round(limits.max / 6).toLocaleString("en-IN")} words).` },
      { status: 400 }
    );
  }

  const plan = await getUserPlan(userId);
  if (plan === "free") {
    return NextResponse.json({ error: "AI Tools are available on paid plans.", code: "UPGRADE_REQUIRED" }, { status: 402 });
  }

  const words = wordCount(text) * (ALLOWANCE_MULTIPLIER[tool] ?? 1);
  const quota = await checkAndReserveQuota(userId, plan, words);
  if (!quota.allowed) {
    const message =
      quota.reason === "word_allowance_exceeded"
        ? `You've reached your ${PLANS[plan].name} plan's monthly word allowance (${PLANS[plan].monthlyWordAllowance.toLocaleString("en-IN")} words). It resets next month.`
        : `You've reached your ${PLANS[plan].name} plan's monthly usage limit (${quota.limit}). It resets next month.`;
    return NextResponse.json({ error: message }, { status: 429 });
  }

  const ceiling = Math.max(PLANS[plan].outputTokenLimit, MIN_OUTPUT_TOKENS);
  const rawOptions = body.options && typeof body.options === "object" ? body.options : {};

  try {
    const result = await runTool(tool, text, rawOptions, ceiling);
    return NextResponse.json({ result });
  } catch (err) {
    await releaseQuotaUnit(userId, plan, words);
    if (err instanceof ToolError) {
      if (err.code === "config") console.error("[tools] misconfigured:", err.message);
      return NextResponse.json({ error: err.message }, { status: err.code === "config" ? 500 : 502 });
    }
    console.error(`[tools:${tool}] unexpected error`, err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

function runTool(tool: AiToolId, text: string, rawOptions: unknown, ceiling: number) {
  switch (tool) {
    case "grammar":
      return runGrammar(text, toolOptionsSchema.grammar.parse(rawOptions), ceiling);
    case "paraphrase":
      return runParaphrase(text, toolOptionsSchema.paraphrase.parse(rawOptions), ceiling);
    case "summarize":
      return runSummarize(text, toolOptionsSchema.summarize.parse(rawOptions), ceiling);
    case "quiz":
      return runQuiz(text, toolOptionsSchema.quiz.parse(rawOptions), ceiling);
    case "fact-check":
      return runFactCheck(text, ceiling);
  }
}
