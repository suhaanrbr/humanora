import Razorpay from "razorpay";

/**
 * Server-only Razorpay client. RAZORPAY_KEY_SECRET must never reach the
 * browser — every module that imports this file must itself be
 * server-only (API routes, this directory). RAZORPAY_KEY_ID is not
 * secret (it's Razorpay's own public "publishable" identifier used by
 * their client-side checkout script) but is still read from env here
 * rather than hard-coded, so test/live never get mixed by accident.
 */

let cached: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (cached) return cached;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not configured.");
  }

  cached = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return cached;
}

/** The public key id — safe to send to the browser (Razorpay Checkout needs it). */
export function getRazorpayPublicKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) throw new Error("RAZORPAY_KEY_ID is not configured.");
  return keyId;
}
