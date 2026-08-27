import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/dashboard/AppShell";
import { getVerifiedSession } from "@/lib/auth-session";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";

// Defense in depth — this is already behind a real auth boundary below,
// but a private, per-account workspace should never be a candidate for
// a search result regardless.
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * The real authorization boundary for /dashboard/*. middleware.ts already
 * redirects unauthenticated requests based on cookie presence alone (fast,
 * but not proof of a valid session) — this layout independently verifies
 * the session server-side via Better Auth before rendering anything, so
 * an expired/forged/revoked cookie can never reach real user data.
 *
 * Only a genuinely ABSENT session redirects to /login. A session lookup
 * that THROWS (e.g. a transient database connectivity hiccup — see the
 * comment on lib/db/client.ts) is a different situation and must not be
 * presented as "you're logged out" — that was a real bug: a valid,
 * already-authenticated user occasionally got bounced to /login by a
 * one-off DB error unrelated to their session's validity. See
 * lib/auth-session.ts for the full reasoning.
 *
 * Uses AppShell (Stage 2's persistent rail/bottom-nav environment), not
 * the marketing Header — a separate concern from auth, but this is the
 * one place both are assembled together for every /dashboard/* page.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const result = await getVerifiedSession();

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  if (result.status === "error") {
    return (
      <AppShell>
        <Container className="mx-auto max-w-md text-center">
          <Card className="p-8">
            <p className="text-sm font-medium text-foreground">HUMANORA is temporarily unavailable</p>
            <p className="mt-2 text-sm text-foreground-muted">
              We couldn&apos;t confirm your session just now — this is usually momentary. Your login is
              not affected.
            </p>
            <ButtonLink href="/dashboard" variant="primary" size="sm" className="mt-5">
              Try again
            </ButtonLink>
          </Card>
        </Container>
      </AppShell>
    );
  }

  return <AppShell>{children}</AppShell>;
}
