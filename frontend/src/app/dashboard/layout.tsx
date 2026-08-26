import { redirect } from "next/navigation";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { getVerifiedSession } from "@/lib/auth-session";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";

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
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const result = await getVerifiedSession();

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  if (result.status === "error") {
    return (
      <>
        <Header />
        <main className="flex-1 py-16">
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
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 py-12 sm:py-16">{children}</main>
      <Footer />
    </>
  );
}
