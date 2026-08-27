import { NextRequest, NextResponse } from "next/server";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";
import { renameVoiceProfile, setDefaultVoiceProfile, deleteVoiceProfile } from "@/lib/db/voice";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { name, isDefault } = (body ?? {}) as Record<string, unknown>;

  // Both operations are ownership-checked inside lib/db/voice.ts — an
  // id that isn't the caller's own is a silent no-op, never a mutation
  // of someone else's profile.
  if (typeof name === "string") await renameVoiceProfile(auth.userId, id, name);
  if (isDefault === true) await setDefaultVoiceProfile(auth.userId, id);

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);
  const { id } = await params;

  await deleteVoiceProfile(auth.userId, id);
  return NextResponse.json({ ok: true });
}
