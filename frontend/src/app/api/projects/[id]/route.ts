import { NextRequest, NextResponse } from "next/server";
import { deleteProject, getProjectWithItems } from "@/lib/db/projects";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);

  const { id } = await params;
  const result = await getProjectWithItems(auth.userId, id);
  if (!result) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  return NextResponse.json(result);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);

  const { id } = await params;
  // Ownership-scoped — see deleteProject's WHERE clause.
  await deleteProject(auth.userId, id);
  return NextResponse.json({ ok: true });
}
