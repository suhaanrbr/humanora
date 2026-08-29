import { NextRequest, NextResponse } from "next/server";
import { analyzeForAiPatterns, DetectorError } from "@/lib/ai/detector";
import { checkRateLimit } from "@/lib/ai/rateLimit";
import { getUserPlan } from "@/lib/db/entitlement";
import { checkAndReserveQuota, releaseQuotaUnit } from "@/lib/db/usage";
import { saveDetectorScan, getDetectorScansForUser } from "@/lib/db/detector";
import { PLANS } from "@/lib/config/plans";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

// Same burst-guard pattern as /api/humanize and /api/study, keyed
// separately so heavy use of one tool never exhausts another's
// short-window allowance.
const BURST_LIMIT = { requests: 20, windowMs: 60 * 1000 };
const MAX_INPUT_CHARS = 20_000;
const MIN_INPUT_CHARS = 100; // below this, a categorical AI/human assessment has essentially no signal to work with

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function GET(req: NextRequest) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);
  const scans = await getDetectorScansForUser(auth.userId, 20);
  return NextResponse.json({ scans });
}

export async function POST(req: NextRequest) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);
  const userId = auth.userId;

  const burst = checkRateLimit(`detector-burst:${userId}`, BURST_LIMIT.requests, BURST_LIMIT.windowMs);
  if (!burst.allowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { text } = (body ?? {}) as Record<string, unknown>;
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Please provide some text to analyze." }, { status: 400 });
  }
  const trimmed = text.trim();
  if (trimmed.length < MIN_INPUT_CHARS) {
    return NextResponse.json(
      { error: `Please provide at least ${MIN_INPUT_CHARS} characters — shorter text doesn't carry enough signal for a meaningful assessment.` },
      { status: 400 }
    );
  }
  if (trimmed.length > MAX_INPUT_CHARS) {
    return NextResponse.json({ error: `Text is too long (max ~${Math.round(MAX_INPUT_CHARS / 6)} words).` }, { status: 400 });
  }

  // AI Detector draws from the SAME shared monthly word allowance as
  // Humanize/Study (see docs/AI_COST_MODEL.md's reasoning) rather than
  // a separate quota — and, like Study, is a paid-plan capability; the
  // free plan's one lifetime allowance is reserved for the Humanize
  // trial the marketing site promises.
  const plan = await getUserPlan(userId);
  if (plan === "free") {
    return NextResponse.json(
      { error: "AI Detector is available on paid plans.", code: "UPGRADE_REQUIRED" },
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
    const result = await analyzeForAiPatterns(trimmed);
    const id = await saveDetectorScan({ userId, inputText: trimmed, wordCount: words, result });
    return NextResponse.json({ id, result });
  } catch (err) {
    await releaseQuotaUnit(userId, plan, words);
    if (err instanceof DetectorError) {
      const status = err.code === "config" ? 500 : 502;
      if (err.code === "config") console.error("[detector] misconfigured:", err.message);
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[detector] unexpected error", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
