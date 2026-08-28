import { NextRequest, NextResponse } from "next/server";
import { assignItemToProject } from "@/lib/db/projects";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

/**
 * Files (or un-files, when projectId is null) an existing Humanize/
 * Study item under a project. Both the item and the project are
 * ownership-checked inside assignItemToProject — this route is a thin
 * validated pass-through, not where the security boundary lives.
 */
export async function PATCH(req: NextRequest) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { kind, id, projectId } = (body ?? {}) as Record<string, unknown>;
  if ((kind !== "humanized" && kind !== "study") || typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Invalid item." }, { status: 400 });
  }
  if (projectId !== null && typeof projectId !== "string") {
    return NextResponse.json({ error: "Invalid project." }, { status: 400 });
  }

  try {
    await assignItemToProject(auth.userId, { kind, id }, projectId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't update that item.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
