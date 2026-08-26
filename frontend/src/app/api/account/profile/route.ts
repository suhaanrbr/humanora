import { NextRequest, NextResponse } from "next/server";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";
import { updateUserName } from "@/lib/db/account";

export async function PATCH(req: NextRequest) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name } = (body ?? {}) as Record<string, unknown>;
  if (typeof name !== "string" || !name.trim() || name.trim().length > 80) {
    return NextResponse.json({ error: "Please provide a name up to 80 characters." }, { status: 400 });
  }

  await updateUserName(auth.userId, name.trim());
  return NextResponse.json({ ok: true, name: name.trim() });
}
