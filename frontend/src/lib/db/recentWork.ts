import { inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { project } from "@/lib/db/schema";
import { getHistoryForUser } from "@/lib/db/history";
import { getStudySessionsForUser } from "@/lib/db/study";

export type RecentWorkItem =
  | {
      kind: "humanized";
      id: string;
      mode: string;
      strength: string;
      inputText: string;
      outputText: string;
      createdAt: string;
      projectId: string | null;
      projectName: string | null;
      wordCount: number;
    }
  | {
      kind: "study";
      id: string;
      mode: string;
      inputText: string;
      outputText: string;
      createdAt: string;
      projectId: string | null;
      projectName: string | null;
      wordCount: number;
    };

/**
 * Merges the two real content tables (humanization, study_session) into
 * one chronological feed — this is what "Recent Work," "Recent
 * Activity," and Library all draw from. No `document`/`voice` rows are
 * mixed in (those either don't exist as distinct tables — see
 * schema.ts — or aren't "content" in the same sense), so the Recent
 * Work tabs for Documents/Voice stay disabled.
 *
 * `projectName` is a real, resolved value (not just the id) — one extra
 * scoped query for the distinct project ids actually referenced by this
 * batch, never a per-item query.
 */
export async function getRecentWork(userId: string, limit = 20): Promise<RecentWorkItem[]> {
  const [humanizations, studySessions] = await Promise.all([
    getHistoryForUser(userId, limit),
    getStudySessionsForUser(userId, limit),
  ]);

  const projectIds = Array.from(
    new Set([...humanizations.map((h) => h.projectId), ...studySessions.map((s) => s.projectId)].filter((id): id is string => !!id))
  );
  const projectNames = new Map<string, string>();
  if (projectIds.length > 0) {
    const db = getDb();
    const rows = await db
      .select({ id: project.id, name: project.name, userId: project.userId })
      .from(project)
      .where(inArray(project.id, projectIds));
    for (const row of rows) {
      // Belt-and-suspenders ownership check — projectId on a
      // humanization/study_session row can only ever have been set via
      // assignItemToProject, which already verifies the project belongs
      // to the same user, so this should never filter anything out; it
      // just means a resolved name is never shown for a project that
      // isn't this user's own, even if that invariant were ever broken.
      if (row.userId === userId) projectNames.set(row.id, row.name);
    }
  }

  const items: RecentWorkItem[] = [
    ...humanizations.map((h) => ({
      kind: "humanized" as const,
      id: h.id,
      mode: h.mode,
      strength: h.strength,
      inputText: h.inputText,
      outputText: h.outputText,
      createdAt: h.createdAt.toISOString(),
      projectId: h.projectId,
      projectName: h.projectId ? (projectNames.get(h.projectId) ?? null) : null,
      wordCount: h.wordCount,
    })),
    ...studySessions.map((s) => ({
      kind: "study" as const,
      id: s.id,
      mode: s.mode,
      inputText: s.inputText,
      outputText: s.outputText,
      createdAt: s.createdAt.toISOString(),
      projectId: s.projectId,
      projectName: s.projectId ? (projectNames.get(s.projectId) ?? null) : null,
      wordCount: s.wordCount,
    })),
  ];

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items.slice(0, limit);
}
