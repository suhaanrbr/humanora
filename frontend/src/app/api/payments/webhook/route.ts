import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { paymentOrder } from "@/lib/db/schema";
import { activatePlanFromOrder, isWebhookEventProcessed, markWebhookEventProcessed } from "@/lib/payments/orders";
import type { PaidPlanId } from "@/lib/config/plans";

/**
 * Razorpay webhook — the AUTHORITATIVE payment-confirmation path.
 * /api/payments/verify gives fast UX feedback, but a browser can close,
 * lose network, or simply never call it after a successful payment;
 * this endpoint is what guarantees HUMANORA eventually reaches the
 * correct state regardless. Configured from the Razorpay dashboard
 * (Settings -> Webhooks) once RAZORPAY_WEBHOOK_SECRET exists — see the
 * setup instructions delivered alongside this phase.
 *
 * Only ever reads the RAW request body for signature verification —
 * Razorpay signs the exact bytes it sent, so parsing to JSON first and
 * re-serializing would break verification for any payload whose key
 * order or whitespace differs from what was actually transmitted.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[payments/webhook] RAZORPAY_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await req.text();
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  const valid = a.length === b.length && timingSafeEqual(a, b);
  if (!valid) {
    console.error("[payments/webhook] invalid signature");
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let payload: {
    event?: string;
    payload?: { payment?: { entity?: Record<string, unknown> } };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const event = payload.event;
  const paymentEntity = payload.payload?.payment?.entity;

  // Razorpay retries webhooks that don't return 2xx — every event carries
  // a stable `x-razorpay-event-id` header we use as the idempotency key,
  // so retried or duplicate deliveries are safely ignored after the
  // first successful processing.
  const eventId = req.headers.get("x-razorpay-event-id");
  if (!eventId) {
    return NextResponse.json({ error: "Missing event id." }, { status: 400 });
  }

  if (await isWebhookEventProcessed(eventId)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  try {
    if (event === "payment.captured" && paymentEntity) {
      await handlePaymentCaptured(paymentEntity);
    } else if (event === "payment.failed" && paymentEntity) {
      await handlePaymentFailed(paymentEntity);
    }
    // Other event types are received but intentionally not acted on —
    // HUMANORA doesn't use Razorpay Subscriptions, refunds, or disputes
    // in this architecture yet.
  } catch (err) {
    console.error("[payments/webhook] processing error", event, err);
    // Return 500 so Razorpay retries — the idempotency row is only
    // written on success below, so a genuine transient failure here
    // gets a legitimate retry rather than being silently dropped.
    return NextResponse.json({ error: "Processing error." }, { status: 500 });
  }

  const claimed = await markWebhookEventProcessed(eventId, event ?? "unknown");
  if (!claimed) {
    // Lost a race with a concurrent delivery of the same event id —
    // the other request already recorded it; nothing more to do.
    return NextResponse.json({ ok: true, duplicate: true });
  }

  return NextResponse.json({ ok: true });
}

async function handlePaymentCaptured(entity: Record<string, unknown>) {
  const orderId = entity.order_id as string | undefined;
  const paymentId = entity.id as string | undefined;
  if (!orderId || !paymentId) return;

  const db = getDb();
  const [order] = await db.select().from(paymentOrder).where(eq(paymentOrder.id, orderId));
  if (!order) {
    // An order this webhook doesn't recognize — nothing to activate.
    console.error("[payments/webhook] payment.captured for unknown order", orderId);
    return;
  }

  // Cross-check against what we stored at order-creation time, exactly
  // like the client-verify path — the webhook is authoritative, but
  // still never assumes the amount/currency it's told without checking.
  if (Number(entity.amount) !== order.amountInPaise || entity.currency !== order.currency) {
    console.error("[payments/webhook] amount/currency mismatch for order", orderId);
    return;
  }

  await activatePlanFromOrder(order.id, order.userId, order.planId as PaidPlanId, paymentId);
}

async function handlePaymentFailed(entity: Record<string, unknown>) {
  const orderId = entity.order_id as string | undefined;
  if (!orderId) return;

  const db = getDb();
  // Only ever mark a still-pending order as failed — the `status =
  // 'created'` guard means this can never downgrade an order some other
  // path (client-verify or a payment.captured delivered out of order)
  // already activated as paid.
  await db
    .update(paymentOrder)
    .set({ status: "failed" })
    .where(and(eq(paymentOrder.id, orderId), eq(paymentOrder.status, "created")));
}
