import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { paymentOrder } from "@/lib/db/schema";

/**
 * Returns only the requesting user's own payment history — scoped by
 * userId at the query level, same ownership pattern as history.ts.
 * Never exposes Razorpay internal identifiers beyond the order/payment
 * ids already visible to the user who made the purchase.
 */
export async function getPaymentHistoryForUser(userId: string, limit = 50) {
  const db = getDb();
  return db
    .select()
    .from(paymentOrder)
    .where(eq(paymentOrder.userId, userId))
    .orderBy(desc(paymentOrder.createdAt))
    .limit(limit);
}
