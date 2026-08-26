import { NextRequest, NextResponse } from "next/server";

/**
 * Shared authenticated-userId resolution for API routes. Every route
 * previously did this inline with `catch { return null }`, which
 * conflated two very different situations: "there is genuinely no
 * session" and "the session lookup threw" (a transient DB connectivity
 * hiccup — see lib/db/client.ts). The second case was being reported to
 * the client as 401 AUTH_REQUIRED, which is what made CheckoutButton
 * (and would make anything else checking for 401) bounce an
 * ALREADY-LOGGED-IN user to /login — the exact "randomly loses session"
 * bug. Callers now get a tagged result and return 503 (retry, not a
 * login problem) for a genuine lookup failure, 401 only for a real
 * absence of a session.
 */
export type AuthResult = { status: "ok"; userId: string } | { status: "unauthenticated" } | { status: "error" };

/** Shared 401-vs-503 response for any route's non-"ok" AuthResult. */
export function authErrorResponse(status: "unauthenticated" | "error") {
  return status === "error"
    ? NextResponse.json({ error: "HUMANORA is temporarily unavailable. Please try again shortly." }, { status: 503 })
    : NextResponse.json({ error: "Please log in." }, { status: 401 });
}

export async function resolveAuthenticatedUserId(req: NextRequest): Promise<AuthResult> {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({ headers: req.headers });
    return session?.user.id ? { status: "ok", userId: session.user.id } : { status: "unauthenticated" };
  } catch (err) {
    console.error("[api-auth] session lookup failed", err);
    return { status: "error" };
  }
}
