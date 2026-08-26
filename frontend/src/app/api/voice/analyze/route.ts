import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ai/rateLimit";
import { analyzeAndSaveVoiceProfile, MIN_SAMPLES_TO_ANALYZE } from "@/lib/db/voice";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

// Analysis is a real Gemini call — same burst guard shape as /api/humanize,
// tighter since it should only ever be clicked deliberately, not per-keystroke.
const BURST_LIMIT = { requests: 6, windowMs: 60 * 1000 };

export async function POST(req: NextRequest) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);
  const userId = auth.userId;

  const burst = checkRateLimit(`voice-analyze:${userId}`, BURST_LIMIT.requests, BURST_LIMIT.windowMs);
  if (!burst.allowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const result = await analyzeAndSaveVoiceProfile(userId);
  if (!result.ok) {
    if (result.reason === "no_samples") {
      return NextResponse.json(
        { error: `Add at least ${MIN_SAMPLES_TO_ANALYZE} writing sample first.` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Couldn't analyze your writing right now. Please try again shortly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ profile: result.profile, reused: result.reused });
}
