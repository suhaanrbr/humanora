import { NextRequest, NextResponse } from "next/server";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";
import { deleteUserAccount } from "@/lib/db/account";

/**
 * Irreversible account deletion. The client requires an explicit typed
 * confirmation before this is ever called (see AccountSettings.tsx) —
 * this route itself only re-checks that the caller is authenticated as
 * the account being deleted (never trusts a client-supplied id).
 */
export async function DELETE(req: NextRequest) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);

  await deleteUserAccount(auth.userId);
  return NextResponse.json({ ok: true });
}
