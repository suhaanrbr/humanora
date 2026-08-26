import { NextRequest, NextResponse } from "next/server";
import { saveVoiceOverrides } from "@/lib/db/voice";
import { VOICE_TRAITS, TRAIT_META, type VoiceTrait } from "@/lib/ai/voiceAnalysis";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

export async function PATCH(req: NextRequest) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);
  const userId = auth.userId;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const overrides: Partial<Record<VoiceTrait, string>> = {};

  // Only ever accept known traits with a value from that trait's own
  // enum — never trust arbitrary client-supplied strings into storage.
  for (const trait of VOICE_TRAITS) {
    const value = raw[trait];
    if (typeof value === "string" && (TRAIT_META[trait].options as readonly string[]).includes(value)) {
      overrides[trait] = value;
    }
  }

  await saveVoiceOverrides(userId, overrides);
  return NextResponse.json({ ok: true, overrides });
}
