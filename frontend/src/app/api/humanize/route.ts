import { NextRequest, NextResponse } from "next/server";
import { humanize, HumanizeError, type RewriteStrength, type WritingMode } from "@/lib/ai/humanize";
import { checkRateLimit } from "@/lib/ai/rateLimit";

// Hard caps so a single request can't consume an outsized share of the
// free-tier quota. Tune these against your provider's actual quota once
// real usage data exists.
const MAX_INPUT_CHARS = 2000;
const RATE_LIMIT = { requests: 10, windowMs: 60 * 60 * 1000 }; // 10/hour/IP

const VALID_MODES: WritingMode[] = [
  "natural",
  "academic",
  "professional",
  "concise",
  "casual",
  "persuasive",
];
const VALID_STRENGTHS: RewriteStrength[] = ["light", "balanced", "strong"];

export async function POST(req: NextRequest) {
  // No auth system exists yet — IP is the only identity we have. Once
  // accounts exist, rate-limit by user ID instead (still fall back to IP
  // for anonymous/pre-signup usage).
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = checkRateLimit(`humanize:${ip}`, RATE_LIMIT.requests, RATE_LIMIT.windowMs);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
    );
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
  if (text.length > MAX_INPUT_CHARS) {
    return NextResponse.json(
      { error: `Text is too long. The demo currently supports up to ${MAX_INPUT_CHARS} characters.` },
      { status: 400 }
    );
  }
  const safeMode = VALID_MODES.includes(mode as WritingMode) ? (mode as WritingMode) : "natural";
  const safeStrength = VALID_STRENGTHS.includes(strength as RewriteStrength)
    ? (strength as RewriteStrength)
    : "balanced";

  try {
    const result = await humanize({ text: text.trim(), mode: safeMode, strength: safeStrength });
    return NextResponse.json({ output: result.output });
  } catch (err) {
    if (err instanceof HumanizeError) {
      const status = err.code === "config" ? 500 : 502;
      // Config errors are ours to fix, not the user's — still don't leak
      // internal details in the response.
      if (err.code === "config") console.error("[humanize] misconfigured:", err.message);
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[humanize] unexpected error", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
