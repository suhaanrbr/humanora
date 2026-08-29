import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { studySession, type StudySessionMode } from "@/lib/db/schema";
import { randomUUID } from "crypto";

// Same rationale and cap as history.ts's MAX_HISTORY_PER_USER — a real
// ceiling on stored rows regardless of plan, not a request-counting quota
// (that's usagePeriod's job).
const MAX_SESSIONS_PER_USER = 500;

export interface SaveStudySessionInput {
  userId: string;
  mode: StudySessionMode;
  inputText: string;
  outputText: string;
  wordCount: number;
}

export async function saveStudySession(input: SaveStudySessionInput): Promise<string> {
  const db = getDb();
  const id = randomUUID();
  await db.insert(studySession).values({ id, ...input });

  const rows = await db
    .select({ id: studySession.id })
    .from(studySession)
    .where(eq(studySession.userId, input.userId))
    .orderBy(desc(studySession.createdAt));

  if (rows.length > MAX_SESSIONS_PER_USER) {
    const idsToDelete = rows.slice(MAX_SESSIONS_PER_USER).map((r) => r.id);
    for (const staleId of idsToDelete) {
      await db.delete(studySession).where(eq(studySession.id, staleId));
    }
  }

  return id;
}

/** Scoped by userId at the query level — see history.ts's identical note. */
export async function getStudySessionsForUser(userId: string, limit = 20) {
  const db = getDb();
  return db
    .select()
    .from(studySession)
    .where(eq(studySession.userId, userId))
    .orderBy(desc(studySession.createdAt))
    .limit(limit);
}

export async function deleteStudySession(userId: string, sessionId: string) {
  const db = getDb();
  await db
    .delete(studySession)
    .where(and(eq(studySession.id, sessionId), eq(studySession.userId, userId)));
}
