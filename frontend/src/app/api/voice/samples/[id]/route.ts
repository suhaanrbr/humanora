import { NextRequest, NextResponse } from "next/server";
import { deleteVoiceSample } from "@/lib/db/voice";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);
  const userId = auth.userId;

  const { id } = await params;
  // deleteVoiceSample scopes its WHERE clause by userId AND id — a
  // request for another user's sample id simply deletes nothing.
  await deleteVoiceSample(userId, id);
  return NextResponse.json({ ok: true });
}
