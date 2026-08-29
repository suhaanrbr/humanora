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
import { listProjectsForUser } from "@/lib/db/projects";
import { BillingActions } from "@/components/dashboard/BillingActions";
import { RecentWorkTabs } from "@/components/dashboard/RecentWorkTabs";
import { QuickStart } from "@/components/dashboard/QuickStart";
import { CountUp } from "@/components/dashboard/CountUp";
import { formatDateTime } from "@/lib/formatDate";
import { deriveTitle } from "@/lib/text";
import { PLANS } from "@/lib/config/plans";
import { cn } from "@/lib/cn";
import { getVoiceSnapshot } from "@/lib/db/voice";

export const metadata = { title: "Dashboard — HUMANORA" };

// Real destinations only — no "Long Form Editor"/"Paraphrase Content"/
// "Explain Like I'm 5" as their own routes, since those aren't separate
// tools today (Study is one workspace with internal Summarize/Explain/
// Notes tabs — see StudyWorkspace.tsx). AI Detector is real as of the
// Master Completion phase (lib/ai/detector.ts) — no longer marked
// `soon`. Chat with Document still is (no parsing/RAG pipeline exists).
const QUICK_ACTIONS = [
  { href: "/dashboard/humanize", title: "Humanize AI Text", description: "Rewrite a draft to sound like you.", icon: SparkIcon },
  { href: "/dashboard/study", title: "Summarize Text", description: "Condense long material fast.", icon: SummarizeIcon },
  { href: "/dashboard/study", title: "Explain Like I'm 5", description: "Break a hard topic down simply.", icon: ExplainIcon },
  { href: "/dashboard/study", title: "Study Notes Generator", description: "Turn material into revision notes.", icon: NotesIcon },
  { href: "/dashboard/ai-detector", title: "AI Detector", description: "Check writing for AI patterns.", icon: DetectorIcon },
  { href: "/dashboard/chat-with-docs", title: "Chat with Document", description: "Ask questions of an upload — in development.", icon: ChatIcon, soon: true },
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
  const [usage, recentWork, voice, freeTrial, billing, lifetime, voiceSnapshot, projects] = await Promise.allSettled([
    getUsageSummary(userId, plan),
    getRecentWork(userId, 10),
    getVoiceOverview(userId),
    getFreeTrialStatus(userId),
    getSubscriptionSummary(userId),
    getLifetimeStats(userId),
    getVoiceSnapshot(userId),
    listProjectsForUser(userId),
  ]);

  const mostRecent = recentWork.status === "fulfilled" ? recentWork.value[0] : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Container size="wide" className="flex flex-col gap-10 xl:gap-12">
      {/* Cinematic hero — the settings-background art underneath, but
          hero-cinematic-overlay (globals.css) replaces the flat top-to-
          bottom fade with volumetric corner light + vignette, and the
          stat strip is pulled up to physically overlap the banner's
          bottom edge (glass, floating) rather than sitting as its own
          separate block below — one composed scene, not "image, then a
          row of boxes." */}
      <div>
        <div className="relative isolate overflow-hidden rounded-[2rem] shadow-elevation-floating">
          <Image
            src="/images/settings-background.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 1152px, 100vw"
            className="object-cover"
            aria-hidden="true"
          />
          <div className="hero-cinematic-overlay absolute inset-0" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 px-7 py-10 sm:px-10 sm:py-14 lg:py-16">
            <span className="w-fit rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">
              Workspace
            </span>
            <div>
              <p className="text-sm text-white/70">{greeting},</p>
              <h1 className="text-hero font-bold tracking-tight text-white">{session.user.name}</h1>
            </div>
          </div>
        </div>

        {/* Stat strip — real lifetime totals (lib/db/stats.ts), glass,
            anchored to the hero so it reads as one composed panel. */}
        {lifetime.status === "fulfilled" ? (
          <div className="glass-panel animate-rise-in relative z-10 mx-3 -mt-8 grid grid-cols-2 divide-x divide-y divide-white/[0.06] rounded-2xl shadow-elevation-raised sm:mx-6 sm:-mt-10 xl:grid-cols-4 xl:divide-y-0">
            <StatTile label="Words Humanized" value={lifetime.value.wordsHumanized} icon={SparkIcon} emphasize />
            <StatTile label="Documents Created" value={lifetime.value.documentsCreated} icon={DocumentIcon} />
            <StatTile label="Study Sessions" value={lifetime.value.studySessions} icon={StudyStatIcon} />
            <StatTile label="Time Saved (est.)" value={lifetime.value.timeSavedHoursEstimate} suffix=" hrs" icon={ClockIcon} />
          </div>
        ) : (
          <div className="mt-4">
            <ErrorState message="Couldn't load your stats right now." />
          </div>
        )}
      </div>

      {/* Contextual nudge — real account state only (free trial still
          available, or this month's usage running high), never a
          fabricated "recommendation." Renders at most one line, and
          nothing at all when neither condition is real. */}
      {usage.status === "fulfilled" && freeTrial.status === "fulfilled" && (
        <NudgeBanner plan={plan} freeTrialUsed={freeTrial.value.used} usage={usage.value} />
      )}

      {/* Continue + Quick Start — the "help me decide what to do next"
          layer. Continue only renders when there's real recent work to
          resume (no fabricated "pick up where you left off" for a brand
          new account); Quick Start is a real shortcut into Write/Study,
          not a duplicated mini-tool (see QuickStart.tsx). */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {mostRecent && (
          <Link
            href={mostRecent.kind === "study" ? "/dashboard/study" : "/dashboard/history"}
            className="glass-panel hover-lift group flex flex-col justify-between rounded-2xl p-5"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">Continue</p>
              <p className="mt-2 text-sm font-semibold text-foreground group-hover:text-brand-purple">
                {deriveTitle(mostRecent.inputText)}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-foreground-subtle">{mostRecent.outputText}</p>
            </div>
            <p className="mt-4 text-xs text-foreground-subtle">
              {mostRecent.kind === "humanized" ? "Humanized" : "Studied"} {formatDateTime(mostRecent.createdAt)}
            </p>
          </Link>
        )}
        <div className={cn(!mostRecent && "lg:col-span-2")}>
          <QuickStart />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">
          What do you want to do?
        </h2>
        <div className="animate-stagger-in grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:gap-4">
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
              <Card className="glass-panel relative overflow-hidden p-7 sm:p-9">
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
                  style={{ background: "var(--mesh-1)" }}
                  aria-hidden="true"
                />
                <p className="relative text-base font-semibold text-foreground">Let&apos;s write something.</p>
                <p className="relative mt-1 max-w-sm text-sm text-foreground-muted">
                  Your humanized drafts and study sessions will show up here.
                </p>
                <ButtonLink href="/dashboard/humanize" variant="primary" size="md" className="relative mt-6">
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
          {/* My Workspace — real Projects only, up to 3 most recently
              updated. Priority order per the redesign: Continue / Start
              Something / Recent Work (main column) come first, then
              Workspace context (this + My Voice) before Plan/Usage,
              which matters least on a screen whose job is "what do I do
              next." */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-subtle">My Workspace</h2>
              <Link href="/dashboard/projects" className="text-xs text-foreground-muted underline underline-offset-2 hover:text-foreground">
                View all
              </Link>
            </div>
            {projects.status === "fulfilled" ? (
              projects.value.length === 0 ? (
                <Card className="p-5">
                  <p className="text-sm text-foreground-muted">No projects yet.</p>
                  <ButtonLink href="/dashboard/projects" variant="secondary" size="sm" className="mt-3">
                    Create one
                  </ButtonLink>
                </Card>
              ) : (
                <Card className="glass-panel divide-y divide-white/[0.06] p-0">
                  {projects.value.slice(0, 3).map((p) => (
                    <Link
                      key={p.id}
                      href={`/dashboard/projects/${p.id}`}
                      className="focus-ring press-feedback block p-4 transition-colors hover:bg-white/[0.03]"
                    >
                      <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                      <p className="mt-0.5 text-xs text-foreground-subtle">
                        {p.itemCount} item{p.itemCount === 1 ? "" : "s"}
                      </p>
                    </Link>
                  ))}
                </Card>
              )
            ) : (
              <ErrorState message="Couldn't load your projects right now." />
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">My Voice</h2>
            {voice.status === "fulfilled" ? (
              <Card className="glass-panel p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {voice.value.hasAnalyzedProfile ? "Profile ready" : "Not set up"}
                  </p>
                  <Badge variant={voice.value.hasAnalyzedProfile ? "brand" : "neutral"}>
                    {voice.value.profileCount} profile{voice.value.profileCount === 1 ? "" : "s"}
                  </Badge>
                </div>
                {/* Real trait data (voiceSnapshot), not a fabricated
                    "personality" — the exact same Gemini-derived,
                    Zod-validated fields already used to steer humanize()
                    calls (see lib/ai/voiceAnalysis.ts), just surfaced
                    here instead of only ever consumed silently. */}
                {voiceSnapshot.status === "fulfilled" && voiceSnapshot.value.summary ? (
                  <>
                    <p className="mt-2 text-xs text-foreground-subtle">{voiceSnapshot.value.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {voiceSnapshot.value.traits.map((t) => (
                        <span
                          key={t.label}
                          className="rounded-full border border-brand-purple/25 bg-brand-purple/[0.08] px-2.5 py-1 text-[11px] capitalize text-brand-purple"
                        >
                          {t.label}: {t.value}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-xs text-foreground-subtle">
                    Teach HUMANORA how you write from a few real samples.
                  </p>
                )}
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

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">Plan</h2>
            {usage.status === "fulfilled" && freeTrial.status === "fulfilled" && billing.status === "fulfilled" ? (
              <Card className="glass-panel p-5">
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
                <Card className="glass-panel p-4">
                  <ul className="flex flex-col gap-4">
                    {recentWork.value.slice(0, 5).map((item, i) => (
                      <li key={`${item.kind}-${item.id}`} className="relative flex gap-3 pl-0.5">
                        {/* Connecting line between dots — a real timeline,
                            not a stack of disconnected list rows. */}
                        {i < Math.min(recentWork.value.length, 5) - 1 && (
                          <span
                            aria-hidden="true"
                            className="absolute left-[5px] top-4 h-[calc(100%+0.75rem)] w-px bg-white/[0.08]"
                          />
                        )}
                        <span
                          aria-hidden="true"
                          className={cn(
                            "mt-1.5 h-[10px] w-[10px] shrink-0 rounded-full",
                            item.kind === "humanized" ? "bg-brand-gradient shadow-glow-sm" : "bg-brand-cyan"
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-sm text-foreground">
                            {item.kind === "humanized" ? "Humanized" : "Studied"} &ldquo;{deriveTitle(item.inputText)}&rdquo;
                          </p>
                          <p className="mt-0.5 text-xs text-foreground-subtle">{formatDateTime(item.createdAt)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
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

function NudgeBanner({
  plan,
  freeTrialUsed,
  usage,
}: {
  plan: string;
  freeTrialUsed: boolean;
  usage: { humanizeCount: number; humanizeLimit: number };
}) {
  const usageRatio = usage.humanizeLimit > 0 ? usage.humanizeCount / usage.humanizeLimit : 0;

  if (plan === "free" && !freeTrialUsed) {
    return (
      <NudgeLine href="/dashboard/humanize" icon={SparkIcon}>
        Your complimentary transformation is ready — try Humanize on your own draft.
      </NudgeLine>
    );
  }
  if (plan !== "free" && usageRatio >= 0.8) {
    return (
      <NudgeLine href="/dashboard/billing" icon={ClockIcon}>
        You&apos;ve used {usage.humanizeCount} of {usage.humanizeLimit} humanizations this month.
      </NudgeLine>
    );
  }
  return null;
}

function NudgeLine({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="focus-ring group flex w-fit items-center gap-2.5 rounded-full border border-brand-purple/25 bg-brand-purple/[0.06] py-2 pl-3 pr-4 text-xs text-foreground-muted transition-colors hover:border-brand-purple/40 hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-brand-purple" />
      {children}
      <span aria-hidden="true" className="text-brand-purple transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}

function StatTile({
  label,
  value,
  suffix = "",
  icon: Icon,
  emphasize,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: (props: { className?: string }) => React.ReactElement;
  emphasize?: boolean;
}) {
  const display = `${value.toLocaleString()}${suffix}`;
  return (
    <div className="flex items-center gap-3 p-4 sm:p-5">
      <span className={cn("icon-chip h-10 w-10 shrink-0", emphasize && "shadow-glow-sm")}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0">
        <p className="text-xs leading-snug text-foreground-subtle">{label}</p>
        <p
          className={cn(
            "mt-0.5 text-xl font-bold tracking-tight sm:text-2xl",
            emphasize ? "text-brand-gradient" : "text-foreground"
          )}
        >
          <CountUp value={value} display={display} />
        </p>
      </div>
    </div>
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

function QuickAction({
  href,
  title,
  description,
  icon: Icon,
  soon,
}: {
  href: string;
  title: string;
  description: string;
  icon: (props: { className?: string }) => React.ReactElement;
  soon?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "focus-ring hover-lift group relative flex items-start gap-3.5 overflow-hidden rounded-xl border p-4.5 transition-[border-color,box-shadow]",
        soon
          ? "border-dashed border-border bg-surface/60 hover:border-border-strong"
          : "border-border bg-surface hover:border-brand-purple/35 hover:shadow-glow-sm"
      )}
    >
      <span className={cn("icon-chip h-10 w-10 shrink-0", soon && "icon-chip-muted")}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {soon && (
            <Badge variant="neutral" className="shrink-0 text-[10px]">
              Soon
            </Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-foreground-subtle">{description}</p>
      </div>
    </Link>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function SummarizeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function ExplainIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 16v.01M12 8a2.2 2.2 0 0 1 2.2 2.2c0 1.6-2.2 1.8-2.2 3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function NotesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4.5" y="3.5" width="15" height="17" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 8.5h8M8 12.5h8M8 16.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function DetectorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="m20.5 20.5-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 5.5h16v10H9l-4 3.5v-3.5H4Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6.5 3.5h8l4 4v13a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3.5V8h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function StudyStatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="4" width="7" height="16" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="4" width="7" height="9.5" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
