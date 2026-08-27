import { NextRequest, NextResponse } from "next/server";
import { deleteVoiceSample } from "@/lib/db/voice";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);
  const userId = auth.userId;

  const { id } = await params;
  const profileId = req.nextUrl.searchParams.get("profileId");
  if (!profileId) return NextResponse.json({ error: "Missing profileId." }, { status: 400 });

  // deleteVoiceSample scopes its WHERE clause by userId AND profileId
  // AND sample id — a request for another user's sample (or the right
  // sample under the wrong profile) simply deletes nothing.
  await deleteVoiceSample(userId, profileId, id);
  return NextResponse.json({ ok: true });
}
