import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { user, account } from "@/lib/db/schema";

/** The sign-in method(s) linked to this account — "credential" (email/password), "google", etc. */
export async function getLinkedProviders(userId: string): Promise<string[]> {
  const db = getDb();
  const rows = await db.select({ providerId: account.providerId }).from(account).where(eq(account.userId, userId));
  return Array.from(new Set(rows.map((r) => r.providerId)));
}

export async function updateUserName(userId: string, name: string): Promise<void> {
  const db = getDb();
  await db.update(user).set({ name, updatedAt: new Date() }).where(eq(user.id, userId));
}

/**
 * Deletes the user row for the given id. Every other HUMANORA table
 * that references a user (session, account, humanization, voiceProfile,
 * voiceSample, userEntitlement, subscription, paymentOrder) declares
 * `onDelete: "cascade"` on that foreign key (see schema.ts) — deleting
 * this one row is enough for Postgres to remove all of that user's data
 * atomically. There is no card/payment data to separately purge:
 * HUMANORA never stores it (Razorpay does, under its own retention
 * rules), and payment_order only ever held the order/payment id and
 * amount, not instrument details.
 */
export async function deleteUserAccount(userId: string): Promise<void> {
  const db = getDb();
  await db.delete(user).where(eq(user.id, userId));
}
