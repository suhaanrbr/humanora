import { redirect } from "next/navigation";
import Link from "next/link";
import { getVerifiedSession } from "@/lib/auth-session";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getUsageSummary } from "@/lib/db/usage";
import { getHistoryForUser } from "@/lib/db/history";
import { getVoiceOverview } from "@/lib/db/voice";
import { getUserPlan, getFreeTrialStatus, getSubscriptionSummary } from "@/lib/db/entitlement";
import { BillingActions } from "@/components/dashboard/BillingActions";
import { RecentWorkCard } from "@/components/dashboard/RecentWorkCard";
import { TransformationPreview } from "@/components/brand/TransformationPreview";
import { PLANS } from "@/lib/config/plans";

const GETTING_STARTED_STEPS = [
  { title: "Paste a draft", description: "AI-assisted or your own — anything that reads a little stiff." },
  { title: "Pick a mode", description: "Natural, Academic, Professional, and three more." },
  { title: "Get your result", description: "Compare original and rewrite, with a meaning check." },
] as const;

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
      <div>
        <p className="text-sm text-foreground-muted">Welcome back,</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{session.user.name}</h1>
      </div>

      {/* "What do you want to work on?" — three real destinations, not a
          wall of tool cards. Log out already lives in the account menu
          (top-right, every page), so this header has exactly one job. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <QuickAction href="/dashboard/humanize" title="Write" description="Humanize a draft, apply My Voice." />
        <QuickAction href="/dashboard/study" title="Study" description="Summarize, explain, or make notes." />
        <QuickAction href="/dashboard/voice" title="My Voice" description="Teach HUMANORA how you write." />
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
              <Card className="grid grid-cols-1 items-center gap-8 p-7 sm:grid-cols-[1fr_auto] sm:p-9">
                <div>
                  <p className="text-base font-semibold text-foreground">Let&apos;s write something.</p>
                  <p className="mt-1 max-w-sm text-sm text-foreground-muted">
                    Your humanized work will show up here, ready to reopen, copy, or reuse.
                  </p>
                  <div className="mt-6 flex flex-col gap-4">
                    {GETTING_STARTED_STEPS.map((step, i) => (
                      <div key={step.title} className="flex gap-3">
                        <span className="bg-brand-gradient flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{step.title}</p>
                          <p className="text-xs text-foreground-subtle">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <ButtonLink href="/dashboard/humanize" variant="primary" size="md" className="mt-6">
                    Humanize your first draft
                  </ButtonLink>
                </div>
                <TransformationPreview className="hidden w-56 shrink-0 sm:block" />
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
                      {usage.value.wordsProcessed.toLocaleString()} / {usage.value.wordsLimit.toLocaleString()} words
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

function QuickAction({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="focus-ring hover-lift group rounded-lg border border-border bg-surface p-4 transition-[border-color,box-shadow] hover:border-brand-purple/35 hover:shadow-glow-sm"
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-foreground-subtle">{description}</p>
    </Link>
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
