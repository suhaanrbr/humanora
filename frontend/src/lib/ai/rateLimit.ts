/**
 * Minimal in-memory rate limiter, keyed by client IP.
 *
 * HONEST LIMITATION: this only works within a single running server
 * process. On a serverless platform (Vercel) each instance has its own
 * memory, so a client could get up to N requests per instance rather
 * than N total. That's an acceptable gap for now — it still blocks
 * casual abuse and keeps a single runaway client from burning through
 * the AI provider's free-tier quota — but it is NOT a real distributed
 * limit. Before real launch traffic, replace this with a shared store
 * (Upstash Redis has a free tier and is the standard fit for Vercel).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

// Prevent unbounded memory growth from one-off IPs over a long-running
// process — sweep expired buckets occasionally.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();
