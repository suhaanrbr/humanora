import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ai/rateLimit";
import { createOrderForPlan } from "@/lib/payments/orders";

async function requireUserId(req: NextRequest): Promise<string | null> {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({ headers: req.headers });
    return session?.user.id ?? null;
  } catch {
    return null;
  }
}

// Guards against rapid repeat-click order spam — Razorpay orders don't
// charge anything on their own, but there's no reason to let one
// account create unbounded pending orders either.
const BURST_LIMIT = { requests: 10, windowMs: 60 * 1000 };

export async function POST(req: NextRequest) {
  const userId = await requireUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Please log in to choose a plan.", code: "AUTH_REQUIRED" }, { status: 401 });
  }

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
