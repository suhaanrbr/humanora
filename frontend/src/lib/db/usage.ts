import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { usagePeriod, type Plan } from "@/lib/db/schema";
import { randomUUID } from "crypto";

/** Server-side plan limits — the ONLY source of truth for quota
 * enforcement. Never trust a limit or usage count supplied by the
 * client; always re-derive from this table. */
export const PLAN_LIMITS: Record<Plan, { humanizations: number; maxChars: number }> = {
  free: { humanizations: 5, maxChars: 500 * 6 }, // ~500 words
  essential: { humanizations: 100, maxChars: 1500 * 6 },
  pro: { humanizations: 300, maxChars: 3000 * 6 },
  ultra: { humanizations: 2000, maxChars: 5000 * 6 }, // "unlimited*" fair-use cap, not literally infinite
};

function currentPeriodBounds(now = new Date()) {
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { periodStart, periodEnd };
}

async function getOrCreateCurrentPeriod(userId: string) {
  const db = getDb();
  const { periodStart, periodEnd } = currentPeriodBounds();

  const [existing] = await db
    .select()
    .from(usagePeriod)
    .where(and(eq(usagePeriod.userId, userId), eq(usagePeriod.periodStart, periodStart)));

  if (existing) return existing;

  const [created] = await db
    .insert(usagePeriod)
    .values({ id: randomUUID(), userId, periodStart, periodEnd, plan: "free" })
    .returning();
  return created;
}

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: "quota_exceeded";
  remaining: number;
  limit: number;
  plan: Plan;
}

/** Server-side-only check — call this before running an AI request for
 * an authenticated user, never after. */
export async function checkAndReserveQuota(userId: string): Promise<QuotaCheckResult> {
  const db = getDb();
  const period = await getOrCreateCurrentPeriod(userId);
  const limit = PLAN_LIMITS[period.plan].humanizations;

  if (period.humanizeCount >= limit) {
    return { allowed: false, reason: "quota_exceeded", remaining: 0, limit, plan: period.plan };
  }

  await db
    .update(usagePeriod)
    .set({ humanizeCount: period.humanizeCount + 1, updatedAt: new Date() })
    .where(eq(usagePeriod.id, period.id));

  return { allowed: true, remaining: limit - period.humanizeCount - 1, limit, plan: period.plan };
}

export async function recordWordsProcessed(userId: string, words: number) {
  const db = getDb();
  const period = await getOrCreateCurrentPeriod(userId);
  await db
    .update(usagePeriod)
    .set({ wordsProcessed: period.wordsProcessed + words, updatedAt: new Date() })
    .where(eq(usagePeriod.id, period.id));
}

export async function getUsageSummary(userId: string) {
  const period = await getOrCreateCurrentPeriod(userId);
  const limit = PLAN_LIMITS[period.plan].humanizations;
  return {
    plan: period.plan,
    humanizeCount: period.humanizeCount,
    humanizeLimit: limit,
    wordsProcessed: period.wordsProcessed,
    periodEnd: period.periodEnd,
  };
}
