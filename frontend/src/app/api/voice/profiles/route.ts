import { NextRequest, NextResponse } from "next/server";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";
import { listVoiceProfiles, createVoiceProfile } from "@/lib/db/voice";
import { getUserPlan } from "@/lib/db/entitlement";
import { PLANS } from "@/lib/config/plans";

export async function GET(req: NextRequest) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);

  const profiles = await listVoiceProfiles(auth.userId);
  return NextResponse.json({ profiles });
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
  const { name } = (body ?? {}) as Record<string, unknown>;
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Please give this profile a name." }, { status: 400 });
  }

  // The plan limit is resolved server-side from the authenticated
  // user's real subscription state — the client only ever sends a
  // name, never a claimed plan or limit.
  const plan = await getUserPlan(auth.userId);
  const maxProfiles = PLANS[plan].maxVoiceProfiles;

  if (maxProfiles === 0) {
    return NextResponse.json(
      { error: "My Voice requires a paid plan.", code: "UPGRADE_REQUIRED" },
      { status: 402 }
    );
  }

  const result = await createVoiceProfile(auth.userId, name, maxProfiles);
  if (!result.ok) {
    return NextResponse.json(
      {
        error: `Your ${PLANS[plan].name} plan supports up to ${maxProfiles} Voice profile${maxProfiles === 1 ? "" : "s"}.`,
        code: "UPGRADE_REQUIRED",
        reason: "limit_reached",
      },
      { status: 402 }
    );
  }

  return NextResponse.json({ profile: result.profile });
}
