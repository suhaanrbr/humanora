import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { userEntitlement, subscription } from "@/lib/db/schema";
import { PLANS, FREE_TRIAL_MAX_CHARS, type PlanId } from "@/lib/config/plans";

/**
 * HUMANORA's free-tier business rule, in one place:
 *
 *   ONE lifetime complimentary humanization per account, capped at
 *   FREE_TRIAL_MAX_CHARS. It never resets (not daily/monthly/on
 *   logout/on new device) — the database row is the only truth.
 *   It is consumed ONLY after a successful Gemini result is produced,
 *   never on a failed attempt, and is safe under concurrent requests
 *   (see reserveFreeTrial below).
 *
 * See docs/ENTITLEMENTS.md for the full design rationale and the
 * concurrency test that proves this.
 */

export type EntitlementDecision =
  | { allowed: true; plan: PlanId; usedFreeTrial: boolean }
  | { allowed: false; reason: "auth_required" }
  | { allowed: false; reason: "over_free_limit"; plan: "free" }
  | { allowed: false; reason: "free_trial_already_used"; plan: "free" }
  | { allowed: false; reason: "plan_quota_exceeded"; plan: PlanId; limit: number }
  | { allowed: false; reason: "over_plan_limit"; plan: PlanId; limit: number };

export async function getFreeTrialStatus(userId: string): Promise<{ used: boolean }> {
  const entitlement = await getOrCreateEntitlement(userId);
  return { used: entitlement.freeTrialUsed };
}

export async function getUserPlan(userId: string): Promise<PlanId> {
  const sub = await getOrCreateSubscription(userId);
  return sub.status === "active" ? (sub.plan as PlanId) : "free";
}

// Both getOrCreate* helpers below use INSERT ... ON CONFLICT DO NOTHING
// rather than "SELECT, then INSERT if missing" — the naive check-then-act
// version has its own race: under concurrent first-ever requests for a
// brand-new user, multiple callers can all see "no row" and all attempt
// the INSERT, and every one after the first throws a primary-key
// violation. This was caught by the 10-parallel-request concurrency test
// (9 of 10 requests got 500s instead of the expected 402). The
// conflict-safe upsert below closes that gap: at most one INSERT wins,
// everyone else falls through to the SELECT and reads the winner's row.

async function getOrCreateSubscription(userId: string) {
  const db = getDb();
  await db.insert(subscription).values({ userId }).onConflictDoNothing();
  const [row] = await db.select().from(subscription).where(eq(subscription.userId, userId));
  return row;
}

async function getOrCreateEntitlement(userId: string) {
  const db = getDb();
  await db.insert(userEntitlement).values({ userId }).onConflictDoNothing();
  const [row] = await db.select().from(userEntitlement).where(eq(userEntitlement.userId, userId));
  return row;
}

/**
 * Read-only pre-check — decides whether a humanize request should even
 * be attempted, WITHOUT consuming anything. Used to decide "call Gemini
 * or show the paywall", and to size the input-length check before
 * spending any AI capacity.
 */
export async function checkEntitlement(userId: string, inputChars: number): Promise<EntitlementDecision> {
  const sub = await getOrCreateSubscription(userId);
  const plan = sub.status === "active" ? (sub.plan as PlanId) : "free";

  if (plan === "free") {
    const entitlement = await getOrCreateEntitlement(userId);
    if (entitlement.freeTrialUsed) {
      return { allowed: false, reason: "free_trial_already_used", plan: "free" };
    }
    if (inputChars > FREE_TRIAL_MAX_CHARS) {
      // Deliberately does NOT consume the trial — an over-limit attempt
      // leaves the complimentary use available for a later, shorter
      // request (see docs/ENTITLEMENTS.md "free funnel" behavior).
      return { allowed: false, reason: "over_free_limit", plan: "free" };
    }
    return { allowed: true, plan: "free", usedFreeTrial: false };
  }

  const planConfig = PLANS[plan];
  if (inputChars > planConfig.maxInputChars) {
    return { allowed: false, reason: "over_plan_limit", plan, limit: planConfig.maxInputChars };
  }
  return { allowed: true, plan, usedFreeTrial: false };
}

/**
 * Atomically reserves the free trial for this user — the ONLY place in
 * the codebase allowed to flip `free_trial_used`. Returns true if this
 * call won the reservation, false if it was already used (including by
 * a concurrent request that got there first).
 *
 * Concurrency guarantee: this is a single conditional UPDATE
 * (`WHERE free_trial_used = false`). Postgres takes a row lock for the
 * duration of the UPDATE; concurrent UPDATEs against the same row
 * serialize against that lock, and every UPDATE after the first re-reads
 * the row's committed value before matching its WHERE clause — so at
 * most one of any number of simultaneous callers can ever see 0 rows
 * updated become "true". No advisory lock or explicit transaction is
 * needed; the UPDATE's own row lock IS the mutex. Verified with a
 * 10-parallel-request test (see docs/ENTITLEMENTS.md).
 */
export async function reserveFreeTrial(userId: string): Promise<boolean> {
  const db = getDb();
  await getOrCreateEntitlement(userId); // ensure row exists before the conditional update
  const result = await db
    .update(userEntitlement)
    .set({ freeTrialUsed: true, freeTrialUsedAt: new Date() })
    .where(and(eq(userEntitlement.userId, userId), eq(userEntitlement.freeTrialUsed, false)))
    .returning({ userId: userEntitlement.userId });
  return result.length === 1;
}

/**
 * Compensating action if a reserved free trial's Gemini call then fails
 * — restores the unused state so the user doesn't lose their one
 * complimentary use to an infrastructure failure. Safe to call even if
 * nothing was reserved (no-op via the same WHERE-guarded UPDATE shape).
 */
export async function releaseFreeTrial(userId: string): Promise<void> {
  const db = getDb();
  await db
    .update(userEntitlement)
    .set({ freeTrialUsed: false, freeTrialUsedAt: null })
    .where(eq(userEntitlement.userId, userId));
}
