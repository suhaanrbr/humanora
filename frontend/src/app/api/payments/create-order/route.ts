import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ai/rateLimit";
import { createOrderForPlan } from "@/lib/payments/orders";
import { resolveAuthenticatedUserId, authErrorResponse } from "@/lib/api-auth";

// Guards against rapid repeat-click order spam — Razorpay orders don't
// charge anything on their own, but there's no reason to let one
// account create unbounded pending orders either.
const BURST_LIMIT = { requests: 10, windowMs: 60 * 1000 };

export async function POST(req: NextRequest) {
  const auth = await resolveAuthenticatedUserId(req);
  // NOT 401 for a lookup failure — that isn't proof the user is logged
  // out, and reporting it as AUTH_REQUIRED is what previously sent an
  // already-authenticated user back to /login (see lib/api-auth.ts).
  if (auth.status !== "ok") return authErrorResponse(auth.status);
  const userId = auth.userId;

  const burst = checkRateLimit(`payments-create-order:${userId}`, BURST_LIMIT.requests, BURST_LIMIT.windowMs);
  if (!burst.allowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { planId } = (body ?? {}) as Record<string, unknown>;
  if (typeof planId !== "string") {
    return NextResponse.json({ error: "Please choose a plan." }, { status: 400 });
  }

  const result = await createOrderForPlan(userId, planId);
  if (!result.ok) {
    if (result.reason === "invalid_plan") {
      return NextResponse.json({ error: "That plan doesn't exist." }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Couldn't start checkout right now. Please try again shortly." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    orderId: result.orderId,
    amount: result.amountInPaise,
    currency: result.currency,
    keyId: result.keyId,
    planName: result.planName,
  });
}
