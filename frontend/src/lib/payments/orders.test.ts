import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createHmac } from "crypto";
import { verifyRazorpaySignature } from "@/lib/payments/orders";
import { PLANS, isPaidPlanId } from "@/lib/config/plans";

/**
 * Unit tests for the pure, no-I/O pieces of the payment system. These
 * deliberately do NOT hit a real database or the real Razorpay API —
 * per the phase spec, automated tests must never perform real
 * transactions. Signature verification and plan/price mapping are
 * exactly the kind of security-critical pure logic that's cheap to
 * cover this way; the full order-creation/verification/webhook flow
 * was instead verified end-to-end against Razorpay TEST MODE manually
 * (see the phase completion report).
 */

const TEST_SECRET = "test_secret_for_unit_tests_only";

describe("verifyRazorpaySignature", () => {
  const originalSecret = process.env.RAZORPAY_KEY_SECRET;

  beforeEach(() => {
    process.env.RAZORPAY_KEY_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    process.env.RAZORPAY_KEY_SECRET = originalSecret;
  });

  function sign(orderId: string, paymentId: string, secret = TEST_SECRET) {
    return createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  }

  it("accepts a correctly signed order/payment pair", () => {
    const signature = sign("order_ABC", "pay_XYZ");
    expect(verifyRazorpaySignature("order_ABC", "pay_XYZ", signature)).toBe(true);
  });

  it("rejects a signature computed with the wrong secret", () => {
    const signature = sign("order_ABC", "pay_XYZ", "wrong_secret");
    expect(verifyRazorpaySignature("order_ABC", "pay_XYZ", signature)).toBe(false);
  });

  it("rejects a signature for a different order id (tampered order)", () => {
    const signature = sign("order_ABC", "pay_XYZ");
    expect(verifyRazorpaySignature("order_DIFFERENT", "pay_XYZ", signature)).toBe(false);
  });

  it("rejects a signature for a different payment id (tampered payment)", () => {
    const signature = sign("order_ABC", "pay_XYZ");
    expect(verifyRazorpaySignature("order_ABC", "pay_DIFFERENT", signature)).toBe(false);
  });

  it("rejects a malformed (non-hex) signature instead of throwing", () => {
    expect(verifyRazorpaySignature("order_ABC", "pay_XYZ", "not-hex-at-all")).toBe(false);
  });

  it("rejects when RAZORPAY_KEY_SECRET is not configured", () => {
    delete process.env.RAZORPAY_KEY_SECRET;
    const signature = sign("order_ABC", "pay_XYZ");
    expect(verifyRazorpaySignature("order_ABC", "pay_XYZ", signature)).toBe(false);
  });
});

describe("plan configuration — server-controlled pricing", () => {
  it("maps each paid plan to the exact current INR price", () => {
    expect(PLANS.essential.monthlyPriceInr).toBe(399);
    expect(PLANS.pro.monthlyPriceInr).toBe(599);
    expect(PLANS.ultra.monthlyPriceInr).toBe(999);
  });

  it("rejects a plan id that doesn't exist — the browser cannot invent a plan", () => {
    expect(isPaidPlanId("free")).toBe(false); // free is a real plan but not a "paid" one
    expect(isPaidPlanId("legendary")).toBe(false);
    expect(isPaidPlanId("essential")).toBe(true);
  });
});
