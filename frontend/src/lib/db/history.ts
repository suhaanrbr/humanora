import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { humanization } from "@/lib/db/schema";
import { randomUUID } from "crypto";

// A generous but real cap — prevents one account from storing unlimited
// rows. Not a "plan limit" (that's usagePeriod's job for request
// counting) — this is a hard ceiling on stored history regardless of plan.
const MAX_HISTORY_PER_USER = 500;

export interface SaveHumanizationInput {
  userId: string;
  mode: string;
  strength: string;
  inputText: string;
  outputText: string;
  wordCount: number;
}

export async function saveHumanization(input: SaveHumanizationInput) {
  const db = getDb();
  await db.insert(humanization).values({ id: randomUUID(), ...input });

  // Trim oldest rows beyond the cap for this user. Simple and correct;
  // if this ever shows up in profiling, move to a scheduled job instead.
  const rows = await db
    .select({ id: humanization.id })
    .from(humanization)
    .where(eq(humanization.userId, input.userId))
    .orderBy(desc(humanization.createdAt));

  if (rows.length > MAX_HISTORY_PER_USER) {
    const idsToDelete = rows.slice(MAX_HISTORY_PER_USER).map((r) => r.id);
    for (const id of idsToDelete) {
      await db.delete(humanization).where(eq(humanization.id, id));
    }
  }
}

/**
 * Returns only the requesting user's own history — every call is scoped
 * by `userId` at the query level (not filtered client-side), so there is
 * no code path where one user's history rows can be returned for
 * another user's request.
 */
export async function getHistoryForUser(userId: string, limit = 20) {
  const db = getDb();
  return db
    .select()
    .from(humanization)
    .where(eq(humanization.userId, userId))
    .orderBy(desc(humanization.createdAt))
    .limit(limit);
}

export async function deleteHistoryEntry(userId: string, entryId: string) {
  const db = getDb();
  // The `and(eq(userId), eq(id))` is the ownership check — a user can
  // only ever delete a row that is both the target id AND theirs.
  await db
    .delete(humanization)
    .where(and(eq(humanization.id, entryId), eq(humanization.userId, userId)));
}
