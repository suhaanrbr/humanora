import { NextRequest, NextResponse } from "next/server";
import { getRecentWork } from "@/lib/db/recentWork";
import { listProjectsForUser } from "@/lib/db/projects";
import { deriveTitle } from "@/lib/text";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

/**
 * Small, real-data-only summary for the command palette's "Continue"
 * entry and "Projects" search group — fetched once, lazily, only when
 * the palette actually opens (see CommandPalette.tsx), not on every
 * page load. No fabricated content: `mostRecent` is null and `projects`
 * is `[]` for a brand-new account, same as everywhere else in the app.
 */
export async function GET(req: NextRequest) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);

  const [recent, projects] = await Promise.all([
    getRecentWork(auth.userId, 1),
    listProjectsForUser(auth.userId),
  ]);

  const mostRecent = recent[0]
    ? { kind: recent[0].kind, title: deriveTitle(recent[0].inputText) }
    : null;

  return NextResponse.json({
    mostRecent,
    projects: projects.map((p) => ({ id: p.id, name: p.name })),
  });
}
