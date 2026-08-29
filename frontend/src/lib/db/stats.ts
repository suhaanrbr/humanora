import { and, eq, gte, sql } from "drizzle-orm";
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

export interface DailyActivity {
  date: string; // "YYYY-MM-DD"
  humanizations: number;
  studySessions: number;
  words: number;
}

/**
 * Real, day-bucketed activity over the last `days` days — grouped
 * directly from each row's actual `createdAt`, not fabricated. Days
 * with zero activity are still present (0/0/0), so a chart over this
 * never silently compresses gaps into "no data" — a genuinely quiet
 * day looks different from a day this account didn't exist yet.
 */
export async function getDailyActivity(userId: string, days = 14): Promise<DailyActivity[]> {
  const db = getDb();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (days - 1));
  since.setUTCHours(0, 0, 0, 0);

  const [humanizeRows, studyRows] = await Promise.all([
    db
      .select({
        day: sql<string>`to_char(${humanization.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
        words: sql<number>`coalesce(sum(${humanization.wordCount}), 0)::int`,
      })
      .from(humanization)
      .where(and(eq(humanization.userId, userId), gte(humanization.createdAt, since)))
      .groupBy(sql`to_char(${humanization.createdAt}, 'YYYY-MM-DD')`),
    db
      .select({
        day: sql<string>`to_char(${studySession.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
        words: sql<number>`coalesce(sum(${studySession.wordCount}), 0)::int`,
      })
      .from(studySession)
      .where(and(eq(studySession.userId, userId), gte(studySession.createdAt, since)))
      .groupBy(sql`to_char(${studySession.createdAt}, 'YYYY-MM-DD')`),
  ]);

  const humanizeByDay = new Map(humanizeRows.map((r) => [r.day, r]));
  const studyByDay = new Map(studyRows.map((r) => [r.day, r]));

  const result: DailyActivity[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    const h = humanizeByDay.get(key);
    const s = studyByDay.get(key);
    result.push({
      date: key,
      humanizations: h?.count ?? 0,
      studySessions: s?.count ?? 0,
      words: (h?.words ?? 0) + (s?.words ?? 0),
    });
  }
  return result;
}

export interface ModeUsage {
  mode: string;
  count: number;
}

/** Real mode-usage distribution across lifetime Humanize output — for Analytics' "how you use HUMANORA" breakdown. */
export async function getHumanizeModeDistribution(userId: string): Promise<ModeUsage[]> {
  const db = getDb();
  const rows = await db
    .select({ mode: humanization.mode, count: sql<number>`count(*)::int` })
    .from(humanization)
    .where(eq(humanization.userId, userId))
    .groupBy(humanization.mode);
  return rows.sort((a, b) => b.count - a.count);
}
