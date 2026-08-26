import "server-only";
import { cache } from "react";
import { headers } from "next/headers";

/**
 * The single place every server component/layout under /dashboard
 * resolves the current session from. Two real problems this fixes:
 *
 * 1. Previously, dashboard/layout.tsx AND every dashboard page (page.tsx,
 *    humanize/page.tsx, voice/page.tsx) each independently called
 *    `auth.api.getSession()` — a separate DB round trip per component,
 *    each one a separate point of failure within the same request.
 *    `cache()` memoizes this per-request (React's server-component
 *    request cache), so a layout + page rendering together make exactly
 *    ONE session lookup, not two or three.
 *
 * 2. The old fail-closed pattern conflated two different situations
 *    into one `redirect("/login")`: "there truly is no valid session"
 *    (correct to redirect) and "the session lookup itself threw" (a DB
 *    connectivity hiccup — see lib/db/client.ts — NOT proof the user
 *    is logged out). Bouncing an actually-authenticated user to /login
 *    because of a transient infra error is exactly the "randomly loses
 *    their session" bug this fixes. This module returns a tagged result
 *    so callers can tell the two apart and react differently: redirect
 *    for "unauthenticated", show a retryable error for "lookup failed".
 */

export type SessionResult =
  | { status: "authenticated"; session: NonNullable<Awaited<ReturnType<typeof rawGetSession>>> }
  | { status: "unauthenticated" }
  | { status: "error" };

async function rawGetSession() {
  const { auth } = await import("@/lib/auth");
  return auth.api.getSession({ headers: await headers() });
}

export const getVerifiedSession = cache(async (): Promise<SessionResult> => {
  try {
    const session = await rawGetSession();
    return session ? { status: "authenticated", session } : { status: "unauthenticated" };
  } catch (err) {
    // Next.js signals its own internal control flow (e.g. bailing a
    // route to dynamic rendering because it used `headers()`) by
    // throwing a tagged error that MUST keep propagating — swallowing
    // it here would fight the framework's own static/dynamic detection.
    // Only a genuine lookup failure (a real thrown error from Better
    // Auth/the DB) should be reported as "error".
    if (err && typeof err === "object" && "digest" in err && typeof err.digest === "string" && err.digest.startsWith("DYNAMIC_SERVER_USAGE")) {
      throw err;
    }
    console.error("[auth] session lookup failed", err);
    return { status: "error" };
  }
});
