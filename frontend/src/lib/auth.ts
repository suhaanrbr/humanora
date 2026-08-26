import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/lib/db/client";

/**
 * HUMANORA authentication (server-side). Email/password only for now —
 * that's the simplest thing that supports the full
 * signup → verify → login → session → logout journey without requiring
 * an OAuth app registration (Google/GitHub) or an email-sending service
 * (both of which would need a decision — and possibly a paid service —
 * this project hasn't made yet). Adding a social provider later is a
 * config addition here, not a rearchitecture.
 *
 * IMPORTANT: this module calls getDb() at import time, which throws if
 * DATABASE_URL isn't set. Anything that needs to keep working without a
 * database configured (the public humanize demo, the dashboard's
 * redirect-on-no-session) must `await import("@/lib/auth")` inside a
 * try/catch rather than importing this statically at the top of the
 * file — see app/api/humanize/route.ts and app/dashboard/layout.tsx.
 * (An earlier version lazily proxied the DB object instead so this
 * module could always be statically imported — that broke Better
 * Auth's internal schema introspection in confusing ways. Dynamic
 * import at the call site is the more reliable way to get the same
 * "degrade gracefully without a DB" behavior.)
 */
export const auth = betterAuth({
  database: drizzleAdapter(getDb(), { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    // No email-sending service is configured yet (would require a free-
    // tier decision of its own — Resend's free tier is the likely
    // candidate, but that's a separate approval, not assumed here).
    // Accounts are usable immediately; add requireEmailVerification
    // once a mail provider is wired up.
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh once per day of activity
  },
});
