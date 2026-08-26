import { NextRequest, NextResponse } from "next/server";
import { deleteVoiceSample } from "@/lib/db/voice";

async function requireUserId(req: NextRequest): Promise<string | null> {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({ headers: req.headers });
    return session?.user.id ?? null;
  } catch {
    return null;
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId(req);
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { id } = await params;
  // deleteVoiceSample scopes its WHERE clause by userId AND id — a
  // request for another user's sample id simply deletes nothing.
  await deleteVoiceSample(userId, id);
  return NextResponse.json({ ok: true });
}
