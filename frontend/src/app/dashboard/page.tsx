import { redirect } from "next/navigation";
import Link from "next/link";
import { getVerifiedSession } from "@/lib/auth-session";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { getUsageSummary } from "@/lib/db/usage";
import { getHistoryForUser } from "@/lib/db/history";
import { getVoiceOverview } from "@/lib/db/voice";
import { getUserPlan, getFreeTrialStatus, getSubscriptionSummary } from "@/lib/db/entitlement";
import { BillingActions } from "@/components/dashboard/BillingActions";
import { RecentWorkCard } from "@/components/dashboard/RecentWorkCard";
import { PLANS } from "@/lib/config/plans";

export const metadata = { title: "Dashboard — HUMANORA" };

export default async function DashboardPage() {
  // getVerifiedSession() is request-memoized (see lib/auth-session.ts) —
  // this reuses the exact same lookup the layout already made, no
  // second DB round trip. The layout already redirects on "unauthenticated"
  // and renders its own error state on "error", but this branch is kept
  // as a defensive fallback rather than assuming that can never reach here.
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") {
    redirect("/login");
  }
  const session = result.session;
  const userId = session.user.id;
  const plan = await getUserPlan(userId);

  // Each data source degrades independently — a database hiccup on one
  // (e.g. usage) shouldn't take down the whole dashboard.
  const [usage, history, voice, freeTrial, billing] = await Promise.allSettled([
    getUsageSummary(userId, plan),
    getHistoryForUser(userId, 5),
    getVoiceOverview(userId),
    getFreeTrialStatus(userId),
    getSubscriptionSummary(userId),
  ]);

  return (
    <Container className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-foreground-muted">Welcome back,</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{session.user.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <ButtonLink href="/dashboard/humanize" variant="primary" size="md">
            Humanize text
          </ButtonLink>
          <SignOutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Main column: recent work is the reason someone opens the dashboard daily */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-subtle">
              Recent work
            </h2>
            {history.status === "fulfilled" && history.value.length > 0 && (
              <Link
                href="/dashboard/history"
                className="text-xs text-foreground-muted underline underline-offset-2 hover:text-foreground"
              >
                View all
              </Link>
            )}
          </div>

          {history.status === "fulfilled" ? (
            history.value.length === 0 ? (
              <Card className="flex flex-col items-center gap-3 p-10 text-center">
                <p className="text-sm text-foreground-muted">Nothing humanized yet.</p>
                <p className="max-w-xs text-xs text-foreground-subtle">
                  Paste a draft into the Humanizer and your work will show up here, ready to reopen,
                  copy, or reuse.
                </p>
                <ButtonLink href="/dashboard/humanize" variant="secondary" size="sm" className="mt-1">
                  Humanize your first draft
                </ButtonLink>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {history.value.map((entry) => (
                  <RecentWorkCard
                    key={entry.id}
                    inputText={entry.inputText}
                    outputText={entry.outputText}
                    mode={entry.mode}
                    strength={entry.strength}
                    createdAt={entry.createdAt.toISOString()}
                  />
                ))}
              </div>
            )
          ) : (
            <ErrorCard message="Couldn't load your recent work right now." />
          )}
        </section>

        {/* Sidebar: account state you'd otherwise have to go hunting for */}
        <aside className="flex flex-col gap-6">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">
              Plan
            </h2>
            {usage.status === "fulfilled" && freeTrial.status === "fulfilled" && billing.status === "fulfilled" ? (
              <Card className="p-5">
                {plan === "free" ? (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {billing.value.isExpired ? PLANS[billing.value.plan].name : "Free"}
                      </p>
                      <Badge variant="neutral">Free plan</Badge>
                    </div>
                    <p className="mt-2 text-xs text-foreground-subtle">
                      {billing.value.isExpired
                        ? `Access ended ${billing.value.currentPeriodEnd?.toLocaleDateString()}.`
                        : freeTrial.value.used
                          ? "Complimentary transformation used."
                          : "Complimentary transformation available."}
                    </p>
                    {(freeTrial.value.used || billing.value.isExpired) && (
                      <div className="mt-3">
                        <BillingActions />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium capitalize text-foreground">{usage.value.plan}</p>
                      <Badge variant="brand">Active</Badge>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full border border-border">
                      <div
                        className="bg-brand-gradient h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (usage.value.humanizeCount / usage.value.humanizeLimit) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-foreground-subtle">
                      {usage.value.humanizeCount} / {usage.value.humanizeLimit} humanizations ·{" "}
                      {usage.value.wordsProcessed} words
                    </p>
                    {billing.value.currentPeriodEnd && (
                      <p className="mt-1 text-xs text-foreground-subtle">
                        Access through {billing.value.currentPeriodEnd.toLocaleDateString()}
                      </p>
                    )}
                  </>
                )}
                <div className="mt-4 border-t border-border pt-3">
                  <Link
                    href="/dashboard/billing"
                    className="text-xs text-foreground-muted underline underline-offset-2 hover:text-foreground"
                  >
                    {plan === "free" ? "View plans" : "Manage billing"}
                  </Link>
                </div>
              </Card>
            ) : (
              <ErrorCard message="Couldn't load your plan right now." />
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">
              My Voice
            </h2>
            {voice.status === "fulfilled" ? (
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {voice.value.hasAnalyzedProfile ? "Profile ready" : "Not set up"}
                  </p>
                  <Badge variant={voice.value.hasAnalyzedProfile ? "brand" : "neutral"}>
                    {voice.value.profileCount} profile{voice.value.profileCount === 1 ? "" : "s"}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-foreground-subtle">
                  {voice.value.hasAnalyzedProfile
                    ? "Pick it next to Mode when humanizing text on a paid plan."
                    : "Teach HUMANORA how you write from a few real samples."}
                </p>
                <div className="mt-3">
                  <ButtonLink href="/dashboard/voice" variant="secondary" size="sm">
                    {voice.value.profileCount === 0 ? "Get started" : "Open"}
                  </ButtonLink>
                </div>
              </Card>
            ) : (
              <ErrorCard message="Couldn't load your Voice profile right now." />
            )}
          </section>
        </aside>
      </div>

      <p className="text-center text-xs text-foreground-subtle">
        Need something else?{" "}
        <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">
          Contact us
        </Link>
      </p>
    </Container>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <Card className="border-danger/30 bg-danger/5 p-6 text-center">
      <p className="text-sm text-foreground-muted">{message}</p>
      <p className="mt-1 text-xs text-foreground-subtle">Please refresh, or try again shortly.</p>
    </Card>
  );
}
