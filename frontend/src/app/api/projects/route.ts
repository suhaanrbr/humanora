import { NextRequest, NextResponse } from "next/server";
import { createProject, listProjectsForUser } from "@/lib/db/projects";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);

  const projects = await listProjectsForUser(auth.userId);
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, description } = (body ?? {}) as Record<string, unknown>;
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Give your project a name." }, { status: 400 });
  }

  try {
    const id = await createProject(auth.userId, name, typeof description === "string" ? description : undefined);
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't create that project.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
