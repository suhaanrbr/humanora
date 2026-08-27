import { NextRequest, NextResponse } from "next/server";
import {
  addVoiceSample,
  listVoiceSamples,
  getOwnedVoiceProfile,
  MAX_SAMPLE_WORDS,
  MIN_SAMPLE_WORDS,
} from "@/lib/db/voice";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);

  const profileId = req.nextUrl.searchParams.get("profileId");
  if (!profileId) return NextResponse.json({ error: "Missing profileId." }, { status: 400 });

  const profile = await getOwnedVoiceProfile(auth.userId, profileId);
  if (!profile) return NextResponse.json({ error: "Voice profile not found." }, { status: 404 });

  const samples = await listVoiceSamples(profileId);
  return NextResponse.json({ samples });
}

export async function POST(req: NextRequest) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { profileId, content } = (body ?? {}) as Record<string, unknown>;
  if (typeof profileId !== "string") {
    return NextResponse.json({ error: "Missing profileId." }, { status: 400 });
  }
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Please provide a writing sample." }, { status: 400 });
  }

  const result = await addVoiceSample(auth.userId, profileId, content);
  if (!result.ok) {
    const messages: Record<typeof result.reason, string> = {
      not_found: "Voice profile not found.",
      too_short: `That sample is too short — add at least ${MIN_SAMPLE_WORDS} words so HUMANORA has enough to learn from.`,
      too_long: `That sample is too long — keep individual samples under ${MAX_SAMPLE_WORDS} words.`,
      limit_reached: "You've reached the maximum number of writing samples for this profile. Remove one to add another.",
    };
    const status = result.reason === "not_found" ? 404 : 400;
    return NextResponse.json({ error: messages[result.reason], reason: result.reason }, { status });
  }

  return NextResponse.json({ sample: result.sample });
}
