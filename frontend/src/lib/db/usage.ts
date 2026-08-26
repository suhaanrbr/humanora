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
  reason?: "quota_exceeded";
  remaining: number;
  limit: number;
  plan: PlanId;
}

/**
 * Server-side-only, concurrency-safe quota reservation for PAID plans.
 * Same pattern as the free-trial reservation in entitlement.ts: a
 * single conditional UPDATE (`WHERE humanize_count < limit`) — Postgres'
 * row lock during the UPDATE means concurrent callers serialize and
 * each re-checks the committed count, so usage can never overshoot the
 * plan limit under concurrent requests.
 */
export async function checkAndReserveQuota(userId: string, plan: PlanId): Promise<QuotaCheckResult> {
  const db = getDb();
  const limit = PLANS[plan].monthlyHumanizations;
  const period = await getOrCreateCurrentPeriod(userId, plan);

  const [updated] = await db
    .update(usagePeriod)
    .set({ humanizeCount: sql`${usagePeriod.humanizeCount} + 1`, updatedAt: new Date() })
    .where(and(eq(usagePeriod.id, period.id), lt(usagePeriod.humanizeCount, limit)))
    .returning({ humanizeCount: usagePeriod.humanizeCount });

  if (!updated) {
    return { allowed: false, reason: "quota_exceeded", remaining: 0, limit, plan };
  }
  return { allowed: true, remaining: limit - updated.humanizeCount, limit, plan };
}

/** Compensating action if a reserved quota unit's Gemini call fails. */
export async function releaseQuotaUnit(userId: string, plan: PlanId): Promise<void> {
  const db = getDb();
  const period = await getOrCreateCurrentPeriod(userId, plan);
  await db
    .update(usagePeriod)
    .set({ humanizeCount: sql`GREATEST(${usagePeriod.humanizeCount} - 1, 0)`, updatedAt: new Date() })
    .where(eq(usagePeriod.id, period.id));
}

export async function recordWordsProcessed(userId: string, plan: PlanId, words: number) {
  const db = getDb();
  const period = await getOrCreateCurrentPeriod(userId, plan);
  await db
    .update(usagePeriod)
    .set({ wordsProcessed: sql`${usagePeriod.wordsProcessed} + ${words}`, updatedAt: new Date() })
    .where(eq(usagePeriod.id, period.id));
}

export async function getUsageSummary(userId: string, plan: PlanId) {
  const period = await getOrCreateCurrentPeriod(userId, plan);
  const limit = PLANS[plan].monthlyHumanizations;
  return {
    plan,
    humanizeCount: period.humanizeCount,
    humanizeLimit: limit,
    wordsProcessed: period.wordsProcessed,
    periodEnd: period.periodEnd,
  };
}
