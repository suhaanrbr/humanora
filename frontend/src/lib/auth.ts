import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { getDb } from "@/lib/db/client";
import { SITE_URL } from "@/lib/config/site";

/**
 * Better Auth rejects state-changing requests whose Origin isn't in this
 * list. .env.local's BETTER_AUTH_URL is pinned to the production domain
 * (so the same file works when someone forgets to override it locally),
 * which otherwise makes `npm run dev` on localhost fail with "Invalid
 * origin" — this list restores localhost for dev, keeps the real
 * production domain, and trusts this specific Vercel deployment's own
 * unique hostname (VERCEL_URL/VERCEL_BRANCH_URL, set automatically per
 * deployment) rather than a `*.vercel.app` wildcard, which would trust
 * every Vercel account's deployments, not just this project's. Same
 * fix as on feature/forgot-password (auth.ts); duplicated narrowly here
 * rather than merging that branch's unrelated password-reset work in.
 */
const vercelPreviewOrigins = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
  .filter((host): host is string => !!host)
  .map((host) => `https://${host}`);

const trustedOrigins = [
  "http://localhost:3100",
  "http://localhost:3000",
  SITE_URL,
  ...vercelPreviewOrigins,
];

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * HUMANORA authentication (server-side): email/password, plus Google
 * OAuth when GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are configured (see
 * docs/GOOGLE_LOGIN_SETUP.md). Google is added conditionally — with no
 * client id/secret set, `socialProviders` is simply omitted so
 * email/password keeps working standalone in any environment that
 * hasn't configured Google yet (local dev without the env vars, or
 * before the owner completes the one-time Google Cloud setup).
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
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), { provider: "pg" }),
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    // Accounts are usable immediately; add requireEmailVerification
    // once verification emails (a separate flow from the reset email
    // below) are wanted too.
    requireEmailVerification: false,
    minPasswordLength: 8,
    // Powers the "Forgot password?" flow (ForgotPasswordFormPanel ->
    // authClient.forgetPassword). Uses Resend's free tier — set
    // RESEND_API_KEY to enable; without it, `resend` is null and this
    // throws, which better-auth surfaces to the client as a normal
    // error rather than silently pretending to send an email.
    sendResetPassword: async ({ user, url }) => {
      if (!resend) {
        throw new Error("Password reset email is not configured (missing RESEND_API_KEY).");
      }
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "HUMANORA <onboarding@resend.dev>",
        to: user.email,
        subject: "Reset your HUMANORA password",
        html: `<p>Someone requested a password reset for this HUMANORA account.</p>
<p><a href="${url}">Click here to reset your password</a>. This link expires in 1 hour.</p>
<p>If you didn't request this, you can safely ignore this email.</p>`,
      });
    },
  },
  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: { clientId: googleClientId, clientSecret: googleClientSecret },
        },
      }
    : {}),
  account: {
    // Google always verifies the email address it hands back, so it's
    // safe to link a Google sign-in to an existing email/password
    // account with the same address rather than creating a second,
    // disconnected user (which would otherwise silently split one
    // person's History/My Voice/subscription across two accounts).
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh once per day of activity
  },
});
