import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { humanization, studySession } from "@/lib/db/schema";

// A rough, clearly-labeled estimate, not a measured value — there's no
// tracking of how long a user would have spent writing/studying the
// same material by hand. 200 wpm is a commonly cited average adult
// reading/typing-adjacent pace; good enough for "roughly how much time
// this saved you," not precise to the minute. Surfaced in the UI as
// "Time saved (est.)" so it never reads as a hard measurement.
const ASSUMED_WORDS_PER_MINUTE = 200;

export interface LifetimeStats {
  wordsHumanized: number;
  documentsCreated: number;
  studySessions: number;
  timeSavedHoursEstimate: number;
}

/**
 * Lifetime totals across both content tables, scoped to one user.
 * "Documents Created" = humanizations + study sessions, since those are
 * the only two kinds of saved output today (no separate `document`
 * concept exists yet — see schema.ts's deferred-tables note).
 */
export async function getLifetimeStats(userId: string): Promise<LifetimeStats> {
  const db = getDb();

  const [humanizeAgg] = await db
    .select({
      count: sql<number>`count(*)::int`,
      words: sql<number>`coalesce(sum(${humanization.wordCount}), 0)::int`,
    })
    .from(humanization)
    .where(eq(humanization.userId, userId));

  const [studyAgg] = await db
    .select({
      count: sql<number>`count(*)::int`,
      words: sql<number>`coalesce(sum(${studySession.wordCount}), 0)::int`,
    })
    .from(studySession)
    .where(eq(studySession.userId, userId));

  const wordsHumanized = humanizeAgg.words;
  const totalWords = humanizeAgg.words + studyAgg.words;

  return {
    wordsHumanized,
    documentsCreated: humanizeAgg.count + studyAgg.count,
    studySessions: studyAgg.count,
    timeSavedHoursEstimate: Math.round((totalWords / ASSUMED_WORDS_PER_MINUTE / 60) * 10) / 10,
  };
}
