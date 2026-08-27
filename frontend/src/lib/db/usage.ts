import { and, eq, lt, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { usagePeriod } from "@/lib/db/schema";
import { PLANS, type PlanId } from "@/lib/config/plans";
import { randomUUID } from "crypto";

// Quota numbers live in lib/config/plans.ts (the single authoritative
// source) — this module only tracks and enforces consumption against
// that config, never redefines the numbers.

function currentPeriodBounds(now = new Date()) {
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { periodStart, periodEnd };
}

async function getOrCreateCurrentPeriod(userId: string, plan: PlanId) {
  const db = getDb();
  const { periodStart, periodEnd } = currentPeriodBounds();

  // INSERT ... ON CONFLICT DO NOTHING against the (userId, periodStart)
  // unique index, then SELECT — safe under concurrent first-requests for
  // a new billing period (the naive select-then-insert version let
  // concurrent callers create duplicate period rows; see entitlement.ts
  // for the same class of bug and why this pattern fixes it).
  await db
    .insert(usagePeriod)
    .values({ id: randomUUID(), userId, periodStart, periodEnd, plan })
    .onConflictDoNothing();

  const [row] = await db
    .select()
    .from(usagePeriod)
    .where(and(eq(usagePeriod.userId, userId), eq(usagePeriod.periodStart, periodStart)));

  // Keep the period's recorded plan current — it's a denormalized label
  // for reporting, never the source of truth (subscription is).
  if (row.plan !== plan) {
    await db.update(usagePeriod).set({ plan }).where(eq(usagePeriod.id, row.id));
    return { ...row, plan };
  }
  return row;
}

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: "quota_exceeded" | "word_allowance_exceeded";
  remaining: number;
  limit: number;
  plan: PlanId;
}

/**
 * Server-side-only, concurrency-safe quota reservation for PAID plans.
 * Reserves BOTH the humanization count AND the input word count this
 * request is about to consume in a single conditional UPDATE — Postgres'
 * row lock during the UPDATE means concurrent callers serialize and
 * each re-checks the committed counters, so neither can ever overshoot
 * its plan limit under concurrent requests, same guarantee as the
 * free-trial reservation in entitlement.ts.
 *
 * `words` must be the INPUT word count (the caller already knows this
 * before calling Gemini) — see docs/AI_COST_MODEL.md for why bounding
 * total monthly words (not just request count) is necessary: nothing
 * else stops a plan's full monthly humanization count from each being
 * submitted at that plan's maximum length.
 */
export async function checkAndReserveQuota(userId: string, plan: PlanId, words: number): Promise<QuotaCheckResult> {
  const db = getDb();
  const humanizeLimit = PLANS[plan].monthlyHumanizations;
  const wordLimit = PLANS[plan].monthlyWordAllowance;
  const period = await getOrCreateCurrentPeriod(userId, plan);

  const [updated] = await db
    .update(usagePeriod)
    .set({
      humanizeCount: sql`${usagePeriod.humanizeCount} + 1`,
      wordsProcessed: sql`${usagePeriod.wordsProcessed} + ${words}`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(usagePeriod.id, period.id),
        lt(usagePeriod.humanizeCount, humanizeLimit),
        lt(sql`${usagePeriod.wordsProcessed} + ${words}`, wordLimit + 1)
      )
    )
    .returning({ humanizeCount: usagePeriod.humanizeCount, wordsProcessed: usagePeriod.wordsProcessed });

  if (!updated) {
    // Distinguish which limit actually blocked the request — a second,
    // cheap read is fine here since it only runs on the rejection path.
    const [current] = await db.select().from(usagePeriod).where(eq(usagePeriod.id, period.id));
    const reason: QuotaCheckResult["reason"] =
      current.humanizeCount >= humanizeLimit ? "quota_exceeded" : "word_allowance_exceeded";
    return { allowed: false, reason, remaining: 0, limit: humanizeLimit, plan };
  }
  return { allowed: true, remaining: humanizeLimit - updated.humanizeCount, limit: humanizeLimit, plan };
}

/** Compensating action if a reserved quota unit's Gemini call fails —
 * releases both the humanization count and the word count reserved for
 * that attempt, so a failed call never permanently costs the user
 * quota they didn't get a result for. */
export async function releaseQuotaUnit(userId: string, plan: PlanId, words: number): Promise<void> {
  const db = getDb();
  const period = await getOrCreateCurrentPeriod(userId, plan);
  await db
    .update(usagePeriod)
    .set({
      humanizeCount: sql`GREATEST(${usagePeriod.humanizeCount} - 1, 0)`,
      wordsProcessed: sql`GREATEST(${usagePeriod.wordsProcessed} - ${words}, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(usagePeriod.id, period.id));
}

export async function getUsageSummary(userId: string, plan: PlanId) {
  const period = await getOrCreateCurrentPeriod(userId, plan);
  return {
    plan,
    humanizeCount: period.humanizeCount,
    humanizeLimit: PLANS[plan].monthlyHumanizations,
    wordsProcessed: period.wordsProcessed,
    wordsLimit: PLANS[plan].monthlyWordAllowance,
    periodEnd: period.periodEnd,
  };
}
