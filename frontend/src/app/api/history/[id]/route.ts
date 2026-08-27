import { NextRequest, NextResponse } from "next/server";
import { deleteHistoryEntry } from "@/lib/db/history";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);

  const { id } = await params;
  // deleteHistoryEntry scopes its WHERE clause by userId AND id — a
  // request for another user's entry id simply deletes nothing, same
  // ownership pattern as /api/voice/samples/[id].
  await deleteHistoryEntry(auth.userId, id);
  return NextResponse.json({ ok: true });
}
