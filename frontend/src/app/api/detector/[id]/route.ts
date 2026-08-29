import { NextRequest, NextResponse } from "next/server";
import { deleteDetectorScan } from "@/lib/db/detector";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);

  const { id } = await params;
  await deleteDetectorScan(auth.userId, id);
  return NextResponse.json({ ok: true });
}
