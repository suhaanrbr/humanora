import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { project, humanization, studySession } from "@/lib/db/schema";
import { randomUUID } from "crypto";

const MAX_PROJECTS_PER_USER = 100;
const MAX_NAME_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 280;

export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  itemCount: number;
}

/** Scoped by userId at the query level — same ownership pattern as history.ts/study.ts. */
export async function listProjectsForUser(userId: string): Promise<ProjectSummary[]> {
  const db = getDb();
  const rows = await db.select().from(project).where(eq(project.userId, userId)).orderBy(desc(project.updatedAt));

  // Per-project item counts — two cheap scoped counts rather than a
  // join, since a user's project list is small (capped below) and this
  // keeps each query a simple indexed lookup.
  const counts = await Promise.all(
    rows.map(async (p) => {
      const [humanizations, studySessions] = await Promise.all([
        db.select({ id: humanization.id }).from(humanization).where(eq(humanization.projectId, p.id)),
        db.select({ id: studySession.id }).from(studySession).where(eq(studySession.projectId, p.id)),
      ]);
      return humanizations.length + studySessions.length;
    })
  );

  return rows.map((p, i) => ({ ...p, itemCount: counts[i] }));
}

export async function createProject(userId: string, name: string, description?: string) {
  const db = getDb();

  const existing = await db.select({ id: project.id }).from(project).where(eq(project.userId, userId));
  if (existing.length >= MAX_PROJECTS_PER_USER) {
    throw new Error(`You've reached the ${MAX_PROJECTS_PER_USER}-project limit.`);
  }

  const id = randomUUID();
  await db.insert(project).values({
    id,
    userId,
    name: name.trim().slice(0, MAX_NAME_LENGTH),
    description: description?.trim().slice(0, MAX_DESCRIPTION_LENGTH) || null,
  });
  return id;
}

export async function updateProject(
  userId: string,
  projectId: string,
  fields: { name?: string; description?: string | null }
) {
  const db = getDb();
  const update: { name?: string; description?: string | null; updatedAt: Date } = { updatedAt: new Date() };
  if (fields.name !== undefined) {
    const trimmed = fields.name.trim();
    if (!trimmed) throw new Error("Project name can't be empty.");
    update.name = trimmed.slice(0, MAX_NAME_LENGTH);
  }
  if (fields.description !== undefined) {
    update.description = fields.description?.trim().slice(0, MAX_DESCRIPTION_LENGTH) || null;
  }
  // Ownership-scoped — same pattern as deleteProject below.
  await db.update(project).set(update).where(and(eq(project.id, projectId), eq(project.userId, userId)));
}

export async function deleteProject(userId: string, projectId: string) {
  const db = getDb();
  // Ownership-scoped delete — a request for another user's project id
  // simply deletes nothing (same pattern as deleteHistoryEntry). The
  // project_id FK's ON DELETE SET NULL un-files any humanizations/study
  // sessions filed under it automatically; their own content rows are
  // never touched.
  await db.delete(project).where(and(eq(project.id, projectId), eq(project.userId, userId)));
}

export interface ProjectItem {
  kind: "humanized" | "study";
  id: string;
  mode: string;
  inputText: string;
  outputText: string;
  createdAt: Date;
}

export async function getProjectWithItems(userId: string, projectId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.userId, userId)));
  if (!row) return null;

  const [humanizations, studySessions] = await Promise.all([
    db
      .select()
      .from(humanization)
      .where(and(eq(humanization.projectId, projectId), eq(humanization.userId, userId)))
      .orderBy(desc(humanization.createdAt)),
    db
      .select()
      .from(studySession)
      .where(and(eq(studySession.projectId, projectId), eq(studySession.userId, userId)))
      .orderBy(desc(studySession.createdAt)),
  ]);

  const items: ProjectItem[] = [
    ...humanizations.map((h) => ({
      kind: "humanized" as const,
      id: h.id,
      mode: h.mode,
      inputText: h.inputText,
      outputText: h.outputText,
      createdAt: h.createdAt,
    })),
    ...studySessions.map((s) => ({
      kind: "study" as const,
      id: s.id,
      mode: s.mode,
      inputText: s.inputText,
      outputText: s.outputText,
      createdAt: s.createdAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return { project: row, items };
}

/**
 * Files an existing humanization or study session under a project (or
 * un-files it, when `projectId` is null). Both the item and the target
 * project must belong to the caller — this is the one place a
 * cross-table ownership check matters: without verifying the PROJECT's
 * owner too, a user could file their own content under a project id
 * that happens to belong to someone else, silently linking their
 * content into another account's project list.
 */
export async function assignItemToProject(
  userId: string,
  item: { kind: "humanized" | "study"; id: string },
  projectId: string | null
) {
  const db = getDb();

  if (projectId) {
    const [owned] = await db.select({ id: project.id }).from(project).where(and(eq(project.id, projectId), eq(project.userId, userId)));
    if (!owned) throw new Error("Project not found.");
  }

  const table = item.kind === "humanized" ? humanization : studySession;
  await db
    .update(table)
    .set({ projectId })
    .where(and(eq(table.id, item.id), eq(table.userId, userId)));
}
