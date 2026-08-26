import { NextRequest, NextResponse } from "next/server";
import { humanize, HumanizeError, type RewriteStrength, type WritingMode } from "@/lib/ai/humanize";
import { checkRateLimit } from "@/lib/ai/rateLimit";
import { checkEntitlement, reserveFreeTrial, releaseFreeTrial } from "@/lib/db/entitlement";
import { checkAndReserveQuota, releaseQuotaUnit, recordWordsProcessed } from "@/lib/db/usage";
import { saveHumanization } from "@/lib/db/history";
import { FREE_TRIAL_MAX_CHARS } from "@/lib/config/plans";

// A short-window burst guard on top of the entitlement system — this is
// NOT the quota (the database is), it just stops one account from
// hammering the endpoint faster than a human could plausibly review
// results, independent of how much quota they have left.
const BURST_LIMIT = { requests: 20, windowMs: 60 * 1000 }; // 20/minute/user

const VALID_MODES: WritingMode[] = [
  "natural",
  "academic",
  "professional",
  "concise",
  "casual",
  "persuasive",
];
const VALID_STRENGTHS: RewriteStrength[] = ["light", "balanced", "strong"];

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function POST(req: NextRequest) {
  // Compulsory authentication — there is no anonymous path. `auth` is
  // dynamically imported so a missing DATABASE_URL degrades to a clean
  // 401 rather than crashing this route's import entirely.
  let userId: string | null = null;
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({ headers: req.headers });
    userId = session?.user.id ?? null;
  } catch {
    return NextResponse.json(
      { error: "The service is temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      { error: "Please log in to use HUMANORA.", code: "AUTH_REQUIRED" },
      { status: 401 }
    );
  }

  const burst = checkRateLimit(`humanize-burst:${userId}`, BURST_LIMIT.requests, BURST_LIMIT.windowMs);
  if (!burst.allowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { text, mode, strength } = (body ?? {}) as Record<string, unknown>;

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Please provide some text to humanize." }, { status: 400 });
  }

  const trimmed = text.trim();
  const safeMode = VALID_MODES.includes(mode as WritingMode) ? (mode as WritingMode) : "natural";
  const safeStrength = VALID_STRENGTHS.includes(strength as RewriteStrength)
    ? (strength as RewriteStrength)
    : "balanced";

  // --- Entitlement check (never call Gemini before this passes) ---
  const decision = await checkEntitlement(userId, trimmed.length);

  if (!decision.allowed) {
    if (decision.reason === "over_free_limit") {
      return NextResponse.json(
        {
          error: `Your complimentary HUMANORA experience supports up to ${FREE_TRIAL_MAX_CHARS} characters.`,
          code: "UPGRADE_REQUIRED",
          reason: "over_free_limit",
        },
        { status: 402 }
      );
    }
    if (decision.reason === "free_trial_already_used") {
      return NextResponse.json(
        {
          error: "You've already used your one complimentary HUMANORA transformation. Choose a plan to continue.",
          code: "UPGRADE_REQUIRED",
          reason: "free_trial_used",
        },
        { status: 402 }
      );
    }
    if (decision.reason === "over_plan_limit") {
      return NextResponse.json(
        { error: `Text is too long for your ${decision.plan} plan (max ~${decision.limit} characters).` },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Please log in to use HUMANORA." }, { status: 401 });
  }

  const plan = decision.plan;

  // --- Reserve entitlement BEFORE calling Gemini (concurrency-safe) ---
  let reserved = false;
  if (plan === "free") {
    reserved = await reserveFreeTrial(userId);
    if (!reserved) {
      // Lost a race with a concurrent request — the trial is now used.
      return NextResponse.json(
        {
          error: "You've already used your one complimentary HUMANORA transformation. Choose a plan to continue.",
          code: "UPGRADE_REQUIRED",
          reason: "free_trial_used",
        },
        { status: 402 }
      );
    }
  } else {
    const quota = await checkAndReserveQuota(userId, plan);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: `You've reached your ${plan} plan's monthly humanization limit (${quota.limit}). It resets next month.` },
        { status: 429 }
      );
    }
    reserved = true;
  }

  // --- Call Gemini. On ANY failure, release the reservation — the
  // entitlement is only spent on a genuinely delivered result. ---
  try {
    const result = await humanize({ text: trimmed, mode: safeMode, strength: safeStrength });
    const words = wordCount(trimmed);

    await recordWordsProcessed(userId, plan, words);
    await saveHumanization({
      userId,
      mode: safeMode,
      strength: safeStrength,
      inputText: trimmed,
      outputText: result.output,
      wordCount: words,
    });

    return NextResponse.json({ output: result.output });
  } catch (err) {
    if (plan === "free") {
      await releaseFreeTrial(userId);
    } else {
      await releaseQuotaUnit(userId, plan);
    }
    return handleHumanizeError(err);
  }
}

function handleHumanizeError(err: unknown) {
  if (err instanceof HumanizeError) {
    const status = err.code === "config" ? 500 : 502;
    if (err.code === "config") console.error("[humanize] misconfigured:", err.message);
    return NextResponse.json({ error: err.message }, { status });
  }
  console.error("[humanize] unexpected error", err);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
