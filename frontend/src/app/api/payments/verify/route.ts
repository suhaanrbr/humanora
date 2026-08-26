import { NextRequest, NextResponse } from "next/server";
import { verifyAndActivatePayment } from "@/lib/payments/orders";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

/**
 * Client-side confirmation of a completed Razorpay Checkout — used for
 * immediate UX feedback ONLY. This is not the sole source of truth: the
 * webhook (see /api/payments/webhook) independently activates the same
 * plan if this call never arrives (browser closed, network drop,
 * etc.). Both paths funnel through the same idempotent
 * activatePlanFromOrder, so whichever arrives first wins and the other
 * is a safe no-op.
 */
export async function POST(req: NextRequest) {
  const auth = await resolveAuthenticatedUserId(req);
  if (auth.status !== "ok") return authErrorResponse(auth.status);
  const userId = auth.userId;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = (body ?? {}) as Record<string, unknown>;
  if (
    typeof razorpay_order_id !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string"
  ) {
    return NextResponse.json({ error: "Invalid payment confirmation." }, { status: 400 });
  }

  const result = await verifyAndActivatePayment(userId, razorpay_order_id, razorpay_payment_id, razorpay_signature);

  if (!result.ok) {
    const messages: Record<typeof result.reason, string> = {
      not_found: "We couldn't find that order.",
      wrong_user: "This order doesn't belong to your account.",
      signature_invalid: "This payment couldn't be verified.",
      payment_mismatch: "This payment doesn't match the expected order.",
      not_captured: "This payment hasn't completed yet.",
    };
    console.error("[payments] verification failed", result.reason, { userId, orderId: razorpay_order_id });
    return NextResponse.json({ error: messages[result.reason] }, { status: 400 });
  }

  return NextResponse.json({ ok: true, plan: result.plan });
}
