import { NextRequest, NextResponse } from "next/server";
import { deleteStudySession } from "@/lib/db/study";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);

  const { id } = await params;
  // deleteStudySession scopes its WHERE clause by userId AND id — same
  // ownership pattern as /api/history/[id].
  await deleteStudySession(auth.userId, id);
  return NextResponse.json({ ok: true });
}
