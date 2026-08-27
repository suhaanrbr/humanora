import { NextRequest, NextResponse } from "next/server";
import { humanize, HumanizeError, type RewriteStrength, type WritingMode } from "@/lib/ai/humanize";
import { checkRateLimit } from "@/lib/ai/rateLimit";
import { checkEntitlement, reserveFreeTrial, releaseFreeTrial } from "@/lib/db/entitlement";
import { checkAndReserveQuota, releaseQuotaUnit, recordWordsProcessed } from "@/lib/db/usage";
import { saveHumanization } from "@/lib/db/history";
import { getEffectiveVoiceProfile } from "@/lib/db/voice";
import { buildStyleDirectives } from "@/lib/ai/voiceAnalysis";
import { checkMeaningPreservation } from "@/lib/ai/meaningCheck";
import { scoreReadability } from "@/lib/ai/readability";
import { FREE_TRIAL_MAX_CHARS, PLANS } from "@/lib/config/plans";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

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
  // Compulsory authentication — there is no anonymous path. A lookup
  // FAILURE (transient DB hiccup) returns 503, not 401 — reporting it as
  // AUTH_REQUIRED would incorrectly read as "you're logged out" to any
  // caller that treats 401 as a login prompt. See lib/api-auth.ts.
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);
  const userId = auth.userId;

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

  const { text, mode, strength, voiceProfileId, customInstructions } = (body ?? {}) as Record<string, unknown>;

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

  // My Voice: only ever loaded for the authenticated user's own id
  // (getEffectiveVoiceProfile's ownership check makes it structurally
  // impossible to resolve someone else's profile), and only used if
  // the plan's real quota (maxVoiceProfiles) allows it — a request
  // can't unlock the feature by just passing a profile id.
  let styleDirectives: string | undefined;
  if (typeof voiceProfileId === "string" && PLANS[plan].maxVoiceProfiles > 0) {
    const voiceProfile = await getEffectiveVoiceProfile(userId, voiceProfileId);
    if (voiceProfile) styleDirectives = buildStyleDirectives(voiceProfile);
  }

  // Custom instructions: a real, plan-gated capability (Pro/Ultra) —
  // capped at a sane length and only ever forwarded if the resolved
  // plan (never client-claimed) actually includes it.
  let safeCustomInstructions: string | undefined;
  if (typeof customInstructions === "string" && customInstructions.trim() && PLANS[plan].customInstructions) {
    safeCustomInstructions = customInstructions.trim().slice(0, 300);
  }

  // --- Call Gemini. On ANY failure, release the reservation — the
  // entitlement is only spent on a genuinely delivered result. ---
  try {
    const result = await humanize({
      text: trimmed,
      mode: safeMode,
      strength: safeStrength,
      styleDirectives,
      customInstructions: safeCustomInstructions,
      variations: PLANS[plan].outputVariations,
    });
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

    // Deterministic, non-AI safety net — never another model call, just
    // pattern matching to flag numbers/percentages/dates/URLs/quotes
    // from the input that don't show up in the output. Informational
    // only; it never blocks a result, just tells the user what to
    // double-check.
    const meaningCheck = checkMeaningPreservation(trimmed, result.output);
    const readability = scoreReadability(result.output);

    return NextResponse.json({ output: result.output, outputs: result.outputs, meaningCheck, readability });
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
