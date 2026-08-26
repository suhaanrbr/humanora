import { describe, it, expect } from "vitest";
import { authErrorResponse } from "@/lib/api-auth";

/**
 * Regression test for the "already-logged-in user gets bounced to
 * /login" bug: a session-lookup FAILURE (e.g. a transient DB hiccup)
 * must never produce the same response shape as a genuine absence of a
 * session — CheckoutButton (and anything else) treats 401 as "go to
 * /login", so a lookup failure must return something else (503) or a
 * caller can't tell the two apart.
 */
describe("authErrorResponse", () => {
  it("returns 401 for a genuine absence of a session", () => {
    const res = authErrorResponse("unauthenticated");
    expect(res.status).toBe(401);
  });

  it("returns 503 (not 401) for a session lookup failure", () => {
    const res = authErrorResponse("error");
    expect(res.status).toBe(503);
  });

  it("the two statuses are never the same value", () => {
    expect(authErrorResponse("unauthenticated").status).not.toBe(authErrorResponse("error").status);
  });
});
