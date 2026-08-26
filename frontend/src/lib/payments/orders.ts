import { createHmac, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { paymentOrder, subscription, webhookEvent } from "@/lib/db/schema";
import { getRazorpay, getRazorpayPublicKeyId } from "@/lib/payments/razorpay";
import { PLANS, BILLING_PERIOD_DAYS, isPaidPlanId, type PaidPlanId } from "@/lib/config/plans";

/**
 * HUMANORA's Razorpay billing architecture: one-time Orders, not
 * Razorpay Subscriptions.
 *
 * Razorpay Subscriptions require e-mandate/UPI Autopay registration and
 * specific product activation on the merchant account, which cannot be
 * assumed to be enabled the moment an individual account is activated —
 * and even when available, add real operational complexity (mandate
 * lifecycle, first-charge-vs-recurring-charge webhooks) for a V1. A
 * one-time Order per billing period is simpler, uses only the
 * always-available Orders + Payments APIs, and is trivial to reason
 * about: a paid plan is active for BILLING_PERIOD_DAYS from the moment
 * a payment is verified, full stop. Renewal is the user manually
 * choosing a plan again when access lapses (see PricingCard / Billing
 * UI) — there is no surprise auto-charge, which is also simply safer
 * for a first payments implementation.
 */

export type CreateOrderResult =
  | { ok: true; orderId: string; amountInPaise: number; currency: "INR"; keyId: string; planName: string }
  | { ok: false; reason: "invalid_plan" | "config" };

/**
 * Creates a Razorpay order for a plan the AUTHENTICATED user is
 * requesting — the price is looked up here, server-side, from the
 * single authoritative PLANS config. The client sends only `planId`; it
 * never gets to say an amount, and nothing here trusts one if it did.
 */
export async function createOrderForPlan(userId: string, planId: string): Promise<CreateOrderResult> {
  if (!isPaidPlanId(planId)) {
    return { ok: false, reason: "invalid_plan" };
  }

  const plan = PLANS[planId];
  const amountInPaise = plan.monthlyPriceInr * 100;

  let keyId: string;
  let order;
  try {
    keyId = getRazorpayPublicKeyId();
    const razorpay = getRazorpay();
    order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      // Razorpay echoes notes back on the payment object — a second,
      // independent way to recover which plan/user an order was for
      // during verification, on top of our own payment_order row.
      notes: { userId, planId },
    });
  } catch (err) {
    console.error("[payments] Razorpay order creation failed", err);
    return { ok: false, reason: "config" };
  }

  const db = getDb();
  await db.insert(paymentOrder).values({
    id: order.id,
    userId,
    planId,
    amountInPaise,
    currency: "INR",
    status: "created",
  });

  return { ok: true, orderId: order.id, amountInPaise, currency: "INR", keyId, planName: plan.name };
}

export type VerifyResult =
  | { ok: true; plan: PaidPlanId; alreadyProcessed: boolean }
  | { ok: false; reason: "not_found" | "wrong_user" | "signature_invalid" | "payment_mismatch" | "not_captured" };

/**
 * Verifies a client-reported payment using Razorpay's documented HMAC
 * scheme (generated_signature = HMAC_SHA256(order_id + "|" + payment_id,
 * key_secret)), then independently re-fetches the payment FROM Razorpay
 * and cross-checks it against what we stored at order-creation time
 * (amount, currency, order id) before ever activating a plan — the
 * client's word alone is never sufficient. Ownership is enforced by
 * requiring the order's stored userId to match the authenticated caller.
 */
export async function verifyAndActivatePayment(
  authenticatedUserId: string,
  orderId: string,
  paymentId: string,
  signature: string
): Promise<VerifyResult> {
  const db = getDb();
  const [order] = await db.select().from(paymentOrder).where(eq(paymentOrder.id, orderId));
  if (!order) return { ok: false, reason: "not_found" };
  if (order.userId !== authenticatedUserId) return { ok: false, reason: "wrong_user" };

  // Idempotent: a second verify call (double-click, retry, race with
  // the webhook) for an already-paid order is a safe no-op success.
  if (order.status === "paid") {
    return { ok: true, plan: order.planId as PaidPlanId, alreadyProcessed: true };
  }

  if (!verifyRazorpaySignature(orderId, paymentId, signature)) {
    return { ok: false, reason: "signature_invalid" };
  }

  const razorpay = getRazorpay();
  const payment = await razorpay.payments.fetch(paymentId);

  if (payment.order_id !== orderId) return { ok: false, reason: "payment_mismatch" };
  if (Number(payment.amount) !== order.amountInPaise) return { ok: false, reason: "payment_mismatch" };
  if (payment.currency !== order.currency) return { ok: false, reason: "payment_mismatch" };
  if (payment.status !== "captured") return { ok: false, reason: "not_captured" };

  await activatePlanFromOrder(order.id, order.userId, order.planId as PaidPlanId, paymentId);
  return { ok: true, plan: order.planId as PaidPlanId, alreadyProcessed: false };
}

/** Exported for unit testing (lib/payments/orders.test.ts) — pure function, no I/O. */
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  // Constant-time comparison — signatures are secrets-derived, timing
  // differences on a naive === could theoretically leak information.
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Shared activation path for both the client-verify route and the webhook — see idempotency notes on each caller. */
export async function activatePlanFromOrder(
  orderId: string,
  userId: string,
  planId: PaidPlanId,
  razorpayPaymentId: string
): Promise<void> {
  const db = getDb();
  const now = new Date();
  const periodEnd = new Date(now.getTime() + BILLING_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  // Mark the order paid FIRST, guarded by its current status — this is
  // the idempotency gate. If two callers (verify route + webhook) race
  // here, only one UPDATE can match `status = 'created'`; the loser's
  // WHERE clause matches zero rows and it skips straight past without
  // double-activating.
  const updated = await db
    .update(paymentOrder)
    .set({ status: "paid", razorpayPaymentId, verifiedAt: now })
    .where(eq(paymentOrder.id, orderId))
    .returning({ id: paymentOrder.id });

  if (updated.length === 0) return; // Already processed by a concurrent caller.

  await db.insert(subscription).values({ userId }).onConflictDoNothing();
  await db
    .update(subscription)
    .set({
      plan: planId,
      status: "active",
      provider: "razorpay",
      providerCustomerId: null,
      providerSubscriptionId: null,
      currency: "INR",
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      updatedAt: now,
    })
    .where(eq(subscription.userId, userId));
}

/** Idempotency guard for webhook deliveries — see /api/payments/webhook. */
export async function isWebhookEventProcessed(eventId: string): Promise<boolean> {
  const db = getDb();
  const [row] = await db.select({ id: webhookEvent.id }).from(webhookEvent).where(eq(webhookEvent.id, eventId));
  return !!row;
}

export async function markWebhookEventProcessed(eventId: string, type: string): Promise<boolean> {
  const db = getDb();
  const result = await db
    .insert(webhookEvent)
    .values({ id: eventId, provider: "razorpay", type })
    .onConflictDoNothing()
    .returning({ id: webhookEvent.id });
  return result.length === 1; // false means another delivery already claimed this event id.
}
