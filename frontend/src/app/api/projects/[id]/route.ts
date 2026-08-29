import { NextRequest, NextResponse } from "next/server";
import { deleteProject, getProjectWithItems, updateProject } from "@/lib/db/projects";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);

  const { id } = await params;
  const result = await getProjectWithItems(auth.userId, id);
  if (!result) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, description } = (body ?? {}) as Record<string, unknown>;
  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    return NextResponse.json({ error: "Give your project a name." }, { status: 400 });
  }
  if (description !== undefined && description !== null && typeof description !== "string") {
    return NextResponse.json({ error: "Invalid description." }, { status: 400 });
  }

  const { id } = await params;
  try {
    await updateProject(auth.userId, id, {
      name: typeof name === "string" ? name : undefined,
      description: description === undefined ? undefined : (description as string | null),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't update that project.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);

  const { id } = await params;
  // Ownership-scoped — see deleteProject's WHERE clause.
  await deleteProject(auth.userId, id);
  return NextResponse.json({ ok: true });
}
