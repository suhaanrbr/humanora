import { NextRequest, NextResponse } from "next/server";
import { generateStudyOutput, StudyError, type StudyMode, type ExplainDepth } from "@/lib/ai/study";
import { checkRateLimit } from "@/lib/ai/rateLimit";
import { getUserPlan } from "@/lib/db/entitlement";
import { checkAndReserveQuota, releaseQuotaUnit } from "@/lib/db/usage";
import { saveStudySession } from "@/lib/db/study";
import { PLANS } from "@/lib/config/plans";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

// Same burst guard as /api/humanize, keyed separately so heavy use of
// one tool can't exhaust the other's short-window allowance — the real
// spend control (the shared monthly word allowance) is enforced below,
// this is just an anti-hammering guard.
const BURST_LIMIT = { requests: 20, windowMs: 60 * 1000 };

const VALID_MODES: StudyMode[] = ["summarize", "explain", "notes"];
const VALID_DEPTHS: ExplainDepth[] = ["simple", "standard", "detailed"];
const MAX_INPUT_CHARS = 30_000; // same ceiling as Ultra's Humanize input — see docs/AI_COST_MODEL.md

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function POST(req: NextRequest) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);
  const userId = auth.userId;

  const burst = checkRateLimit(`study-burst:${userId}`, BURST_LIMIT.requests, BURST_LIMIT.windowMs);
  if (!burst.allowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { text, mode, depth } = (body ?? {}) as Record<string, unknown>;

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Please provide some material to work with." }, { status: 400 });
  }
  const trimmed = text.trim();
  if (trimmed.length > MAX_INPUT_CHARS) {
    return NextResponse.json({ error: `Text is too long (max ~${Math.round(MAX_INPUT_CHARS / 6)} words).` }, { status: 400 });
  }

  const safeMode = VALID_MODES.includes(mode as StudyMode) ? (mode as StudyMode) : "summarize";
  const safeDepth = VALID_DEPTHS.includes(depth as ExplainDepth) ? (depth as ExplainDepth) : "standard";

  // Study is a paid-plan capability — it draws from the SAME shared
  // monthly word allowance and humanization count as Humanize (see
  // docs/AI_COST_MODEL.md), rather than a separate quota per tool. No
  // free-plan path here (free's one lifetime allowance is reserved for
  // the Humanize trial, which is what the marketing site promises).
  const plan = await getUserPlan(userId);
  if (plan === "free") {
    return NextResponse.json(
      { error: "Study tools are available on paid plans.", code: "UPGRADE_REQUIRED" },
      { status: 402 }
    );
  }

  const words = wordCount(trimmed);
  const quota = await checkAndReserveQuota(userId, plan, words);
  if (!quota.allowed) {
    const message =
      quota.reason === "word_allowance_exceeded"
        ? `You've reached your ${plan} plan's monthly word allowance (${PLANS[plan].monthlyWordAllowance.toLocaleString()} words). It resets next month.`
        : `You've reached your ${plan} plan's monthly usage limit (${quota.limit}). It resets next month.`;
    return NextResponse.json({ error: message }, { status: 429 });
  }

  try {
    const result = await generateStudyOutput({
      text: trimmed,
      mode: safeMode,
      depth: safeMode === "explain" ? safeDepth : undefined,
      outputTokenLimit: PLANS[plan].outputTokenLimit,
    });

    await saveStudySession({
      userId,
      mode: safeMode,
      inputText: trimmed,
      outputText: result.output,
      wordCount: words,
    });

    return NextResponse.json({ output: result.output });
  } catch (err) {
    await releaseQuotaUnit(userId, plan, words);
    if (err instanceof StudyError) {
      const status = err.code === "config" ? 500 : 502;
      if (err.code === "config") console.error("[study] misconfigured:", err.message);
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[study] unexpected error", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
