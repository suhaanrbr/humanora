import { NextRequest, NextResponse } from "next/server";
import { humanize, HumanizeError, type RewriteStrength, type WritingMode } from "@/lib/ai/humanize";
import { checkRateLimit } from "@/lib/ai/rateLimit";
import { checkAndReserveQuota, recordWordsProcessed, PLAN_LIMITS } from "@/lib/db/usage";
import { saveHumanization } from "@/lib/db/history";

// Anonymous (no account) cap — this is what keeps the public free demo
// from consuming the whole free AI tier by itself. Logged-in users get
// their own per-plan quota instead (see lib/db/usage.ts), enforced
// server-side and never trusting anything the client reports.
const ANONYMOUS_MAX_INPUT_CHARS = 2000;
const ANONYMOUS_RATE_LIMIT = { requests: 10, windowMs: 60 * 60 * 1000 }; // 10/hour/IP

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
  // Try to identify a logged-in user. `auth` is imported dynamically
  // (not at module top-level) because constructing it calls getDb(),
  // which throws immediately if DATABASE_URL isn't set — a dynamic
  // import here means that throw is caught right below, so the public
  // demo keeps working even before a database is connected, instead of
  // this whole route failing to load.
  let userId: string | null = null;
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({ headers: req.headers });
    userId = session?.user.id ?? null;
  } catch {
    userId = null;
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

  const safeMode = VALID_MODES.includes(mode as WritingMode) ? (mode as WritingMode) : "natural";
  const safeStrength = VALID_STRENGTHS.includes(strength as RewriteStrength)
    ? (strength as RewriteStrength)
    : "balanced";

  if (userId) {
    // Authenticated path: server-side plan quota, real input cap, saved
    // history. Never trust a limit or usage count from the client.
    const quota = await checkAndReserveQuota(userId);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: `You've reached your ${quota.plan} plan's monthly humanization limit (${quota.limit}). It resets next month.` },
        { status: 429 }
      );
    }

    const maxChars = PLAN_LIMITS[quota.plan].maxChars;
    if (text.length > maxChars) {
      return NextResponse.json(
        { error: `Text is too long for your ${quota.plan} plan (max ~${maxChars} characters).` },
        { status: 400 }
      );
    }

    try {
      const result = await humanize({ text: text.trim(), mode: safeMode, strength: safeStrength });
      const words = wordCount(text);
      await recordWordsProcessed(userId, words);
      await saveHumanization({
        userId,
        mode: safeMode,
        strength: safeStrength,
        inputText: text.trim(),
        outputText: result.output,
        wordCount: words,
      });
      return NextResponse.json({ output: result.output });
    } catch (err) {
      return handleHumanizeError(err);
    }
  }

  // Anonymous path: unchanged from the original public-demo behavior —
  // per-IP rate limit, no persistence.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = checkRateLimit(`humanize:${ip}`, ANONYMOUS_RATE_LIMIT.requests, ANONYMOUS_RATE_LIMIT.windowMs);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later, or sign up for a free account." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
    );
  }

  if (text.length > ANONYMOUS_MAX_INPUT_CHARS) {
    return NextResponse.json(
      { error: `Text is too long. The free demo supports up to ${ANONYMOUS_MAX_INPUT_CHARS} characters.` },
      { status: 400 }
    );
  }

  try {
    const result = await humanize({ text: text.trim(), mode: safeMode, strength: safeStrength });
    return NextResponse.json({ output: result.output });
  } catch (err) {
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
