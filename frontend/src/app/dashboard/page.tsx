import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getVerifiedSession } from "@/lib/auth-session";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ErrorState } from "@/components/ui/ErrorState";
import { getUsageSummary } from "@/lib/db/usage";
import { getVoiceOverview } from "@/lib/db/voice";
import { getUserPlan, getFreeTrialStatus, getSubscriptionSummary } from "@/lib/db/entitlement";
import { getLifetimeStats } from "@/lib/db/stats";
import { getRecentWork } from "@/lib/db/recentWork";
import { BillingActions } from "@/components/dashboard/BillingActions";
import { RecentWorkTabs } from "@/components/dashboard/RecentWorkTabs";
import { formatDateTime } from "@/lib/formatDate";
import { deriveTitle } from "@/lib/text";
import { PLANS } from "@/lib/config/plans";

export const metadata = { title: "Dashboard — HUMANORA" };

// Real destinations only — no "Long Form Editor"/"Paraphrase Content"/
// "Explain Like I'm 5" as their own routes, since those aren't separate
// tools today (Study is one workspace with internal Summarize/Explain/
// Notes tabs — see StudyWorkspace.tsx). Each tile still names the
// specific capability the mockup called out; the tiles that don't yet
// have a real backing feature (AI Detector, Chat with Document) route to
// their real "coming soon" pages rather than nowhere.
const QUICK_ACTIONS = [
  { href: "/dashboard/humanize", title: "Humanize AI Text", description: "Rewrite a draft to sound like you." },
  { href: "/dashboard/study", title: "Summarize Text", description: "Condense long material fast." },
  { href: "/dashboard/study", title: "Explain Like I'm 5", description: "Break a hard topic down simply." },
  { href: "/dashboard/study", title: "Study Notes Generator", description: "Turn material into revision notes." },
  { href: "/dashboard/ai-detector", title: "AI Detector", description: "Coming soon." },
  { href: "/dashboard/chat-with-docs", title: "Chat with Document", description: "Coming soon." },
] as const;

export default async function DashboardPage() {
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") {
    redirect("/login");
  }
  const session = result.session;
  const userId = session.user.id;
  const plan = await getUserPlan(userId);

  // Each data source degrades independently — a hiccup on one shouldn't
  // take down the whole dashboard.
  const [usage, recentWork, voice, freeTrial, billing, lifetime] = await Promise.allSettled([
    getUsageSummary(userId, plan),
    getRecentWork(userId, 10),
    getVoiceOverview(userId),
    getFreeTrialStatus(userId),
    getSubscriptionSummary(userId),
    getLifetimeStats(userId),
  ]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Container size="wide" className="flex flex-col gap-8 xl:gap-10">
      {/* Same technique as the Settings page banner: next/image + a dark
          gradient overlay, contained to a rounded block — not the full
          viewport, so the sidebar/rail stays on its own dark surface. */}
      <div className="relative overflow-hidden rounded-3xl">
        <Image
          src="/images/settings-background.png"
          alt=""
          fill
          sizes="(min-width: 1280px) 1152px, 100vw"
          className="object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70" aria-hidden="true" />
        <div className="relative px-6 py-8 sm:px-8">
          <p className="text-sm text-white/80">{greeting},</p>
          <h1 className="text-2xl font-bold tracking-tight text-white">{session.user.name}</h1>
        </div>
      </div>

      {/* Stat tiles — real lifetime totals, see lib/db/stats.ts. */}
      {lifetime.status === "fulfilled" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:gap-4">
          <StatTile label="Words Humanized" value={lifetime.value.wordsHumanized.toLocaleString()} />
          <StatTile label="Documents Created" value={lifetime.value.documentsCreated.toLocaleString()} />
          <StatTile label="Study Sessions" value={lifetime.value.studySessions.toLocaleString()} />
          <StatTile label="Time Saved (est.)" value={`${lifetime.value.timeSavedHoursEstimate} hrs`} />
        </div>
      ) : (
        <ErrorState message="Couldn't load your stats right now." />
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">
          What do you want to do?
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:gap-4">
          {QUICK_ACTIONS.map((action) => (
            <QuickAction key={action.title} {...action} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] xl:gap-12 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Main column: recent work */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-subtle">Recent work</h2>
            {recentWork.status === "fulfilled" && recentWork.value.length > 0 && (
              <Link
                href="/dashboard/history"
                className="text-xs text-foreground-muted underline underline-offset-2 hover:text-foreground"
              >
                View all
              </Link>
            )}
          </div>

          {recentWork.status === "fulfilled" ? (
            recentWork.value.length === 0 ? (
              <Card className="p-7 sm:p-9">
                <p className="text-base font-semibold text-foreground">Let&apos;s write something.</p>
                <p className="mt-1 max-w-sm text-sm text-foreground-muted">
                  Your humanized drafts and study sessions will show up here.
                </p>
                <ButtonLink href="/dashboard/humanize" variant="primary" size="md" className="mt-6">
                  Humanize your first draft
                </ButtonLink>
              </Card>
            ) : (
              <RecentWorkTabs items={recentWork.value} />
            )
          ) : (
            <ErrorState message="Couldn't load your recent work right now." />
          )}
        </section>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">Plan</h2>
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
                    <UsageBar current={usage.value.humanizeCount} limit={usage.value.humanizeLimit} />
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
              <ErrorState message="Couldn't load your plan right now." />
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">My Voice</h2>
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
              <ErrorState message="Couldn't load your Voice profile right now." />
            )}
          </section>

          {/* Recent Activity — the same real rows as "Recent work" above,
              read as a compact feed rather than fabricated event types
              (no "Logged in from Windows"/"Password changed" entries —
              there's no event log backing those yet, see schema.ts). */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">
              Recent Activity
            </h2>
            {recentWork.status === "fulfilled" ? (
              recentWork.value.length === 0 ? (
                <p className="text-xs text-foreground-subtle">Nothing yet.</p>
              ) : (
                <Card className="divide-y divide-border p-0">
                  {recentWork.value.slice(0, 5).map((item) => (
                    <div key={`${item.kind}-${item.id}`} className="p-4">
                      <p className="text-sm text-foreground">
                        {item.kind === "humanized" ? "Humanized" : "Studied"} &ldquo;{deriveTitle(item.inputText)}&rdquo;
                      </p>
                      <p className="mt-0.5 text-xs text-foreground-subtle">{formatDateTime(item.createdAt)}</p>
                    </div>
                  ))}
                </Card>
              )
            ) : (
              <ErrorState message="Couldn't load recent activity right now." />
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

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-foreground-subtle">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight text-foreground">{value}</p>
    </Card>
  );
}

function UsageBar({ current, limit }: { current: number; limit: number }) {
  return (
    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full border border-border">
      <div
        className="bg-brand-gradient h-full rounded-full"
        style={{ width: `${Math.min(100, (current / limit) * 100)}%` }}
      />
    </div>
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
