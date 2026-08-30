"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { BackToHome } from "@/components/dashboard/BackToHome";
import { StudyModeLink } from "@/components/dashboard/StudyModeLink";
import { ProfileForm, DangerZone } from "@/components/dashboard/AccountSettings";
import { formatDate, formatDateTime } from "@/lib/formatDate";
import { deriveTitle } from "@/lib/text";
import { cn } from "@/lib/cn";
import { CornerFrame } from "@/components/landing/cinematic/CornerFrame";

interface RecentWorkItem {
  kind: "humanized" | "study";
  id: string;
  mode: string;
  inputText: string;
  outputText: string;
  createdAt: string;
}
interface LifetimeStats {
  wordsHumanized: number;
  documentsCreated: number;
  studySessions: number;
  timeSavedHoursEstimate: number;
}
interface ModeUsage {
  mode: string;
  count: number;
}
interface ScanSummary {
  id: string;
  wordCount: number;
  likelihood: string;
  createdAt: string;
}
interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}
interface UsageSummary {
  humanizeCount: number;
  humanizeLimit: number;
  wordsProcessed: number;
  periodEnd: Date;
}

const PROVIDER_LABEL: Record<string, string> = {
  credential: "Email & password",
  google: "Google",
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "voice", label: "My Voice" },
  { id: "writing", label: "Writing" },
  { id: "projects", label: "Projects" },
  { id: "activity", label: "Activity" },
  { id: "plan", label: "Plan" },
  { id: "account", label: "Account" },
] as const;
type TabId = (typeof TABS)[number]["id"];

/**
 * HUMANORA's Profile — the user's personal identity inside the
 * product, not a second Settings page. Every number and label here is
 * real (lifetime stats, mode usage, voice traits, projects, recent
 * work) — nothing fabricated (no streaks/scores/rankings). Settings
 * (`/dashboard/settings`) now redirects here with `?tab=account`
 * rather than maintaining a second, overlapping account UI — the
 * Account tab below reuses the exact same `ProfileForm`/`DangerZone`
 * components Settings used to render directly.
 */
export function ProfileWorkspace(props: {
  initialTab?: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  providers: string[];
  plan: string;
  planIsFree: boolean;
  freeTrialUsed: boolean;
  currentPeriodEnd: string | null;
  usage: UsageSummary | null;
  voiceProfileCount: number;
  voiceProfileReady: boolean;
  voiceSummary: string | null;
  voiceTraits: { label: string; value: string }[];
  voiceQuirks: string[];
  recentWork: RecentWorkItem[];
  lifetime: LifetimeStats;
  modeUsage: ModeUsage[];
  scans: ScanSummary[];
  projects: ProjectSummary[];
}) {
  const [tab, setTab] = useState<TabId>(
    TABS.some((t) => t.id === props.initialTab) ? (props.initialTab as TabId) : "overview"
  );
  const initial = props.name.trim()[0]?.toUpperCase() ?? "U";
  const mostRecent = props.recentWork[0] ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackToHome />
        {/* Transparent, not a filled button — this leaves the product
            back to the public marketing site, a lower-frequency action
            than "Home" (the dashboard), so it shouldn't compete
            visually with real workspace actions. */}
        <Link
          href="/"
          className="focus-ring press-feedback group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-sm text-foreground-muted backdrop-blur-sm transition-colors hover:border-brand-purple/35 hover:text-foreground"
        >
          <HLogoIcon className="h-3.5 w-3.5 shrink-0 text-brand-purple" />
          Back to humanora.com
          <span aria-hidden="true" className="text-foreground-subtle transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>

      {/* Asymmetric identity header — not a centered card. Identity on
          the left, a compact voice-fingerprint teaser bleeding in from
          the right (real traits, not decoration) on wide screens. */}
      <div className="glass-panel relative overflow-hidden rounded-3xl p-6 sm:p-9">
        <CornerFrame color="rgba(139,92,246,0.4)" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(50% 60% at 85% 20%, rgba(217,70,239,0.10) 0%, transparent 70%)" }}
        />
        <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex items-center gap-5">
            {props.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- external Google avatar URL
              <img src={props.image} alt="" className="h-16 w-16 shrink-0 rounded-full border border-border" referrerPolicy="no-referrer" />
            ) : (
              <div className="bg-brand-gradient flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white">
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold text-foreground">{props.name}</h1>
                <Badge variant={props.planIsFree ? "neutral" : "brand"}>{props.plan}</Badge>
              </div>
              <p className="truncate text-sm text-foreground-muted">{props.email}</p>
              <p className="mt-1 text-xs text-foreground-subtle">
                Member since {formatDate(props.createdAt)} · signed in with{" "}
                {props.providers.map((p) => PROVIDER_LABEL[p] ?? p).join(" & ") || "email & password"}
              </p>
            </div>
          </div>

          {props.voiceTraits.length > 0 && (
            <button
              type="button"
              onClick={() => setTab("voice")}
              className="focus-ring hover-lift relative hidden h-24 items-center justify-end gap-2 overflow-visible lg:flex"
              aria-label="Jump to My Voice"
            >
              {props.voiceTraits.slice(0, 4).map((t, i) => (
                <span
                  key={t.label}
                  className="rounded-full border border-brand-pink/25 bg-brand-pink/[0.08] px-3 py-1.5 text-xs capitalize text-foreground-muted"
                  style={{ transform: `translateY(${i % 2 === 0 ? "-6px" : "6px"})` }}
                >
                  {t.value}
                </span>
              ))}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "focus-ring press-feedback shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id ? "bg-brand-gradient text-white shadow-glow-sm" : "text-foreground-muted hover:bg-white/[0.04] hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content — key={tab} gives each switch a fresh, respectful
          fade/rise via the existing .animate-rise-in utility rather
          than a layout-shifting instant swap. */}
      <div key={tab} className="animate-rise-in mt-6">
        {tab === "overview" && <OverviewTab {...props} mostRecent={mostRecent} onJump={setTab} />}
        {tab === "voice" && <VoiceTab {...props} />}
        {tab === "writing" && <WritingTab {...props} />}
        {tab === "projects" && <ProjectsTab projects={props.projects} />}
        {tab === "activity" && <ActivityTab recentWork={props.recentWork} />}
        {tab === "plan" && <PlanTab {...props} />}
        {tab === "account" && <AccountTab {...props} />}
      </div>
    </div>
  );
}

function OverviewTab(
  props: Parameters<typeof ProfileWorkspace>[0] & { mostRecent: RecentWorkItem | null; onJump: (t: TabId) => void }
) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-5">
        {props.mostRecent ? (
          <Link
            href={props.mostRecent.kind === "study" ? "/dashboard/study" : "/dashboard/history"}
            className="glass-panel hover-lift group flex flex-col justify-between rounded-2xl p-6"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">Continue</p>
            <p className="mt-2 text-base font-semibold text-foreground group-hover:text-brand-purple">
              {deriveTitle(props.mostRecent.inputText)}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-foreground-subtle">{props.mostRecent.outputText}</p>
            <p className="mt-4 text-xs text-foreground-subtle">
              {props.mostRecent.kind === "humanized" ? "Humanized" : "Studied"} {formatDateTime(props.mostRecent.createdAt)}
            </p>
          </Link>
        ) : (
          <Card className="p-6">
            <p className="text-sm font-medium text-foreground">Let&apos;s write something.</p>
            <p className="mt-1 text-sm text-foreground-muted">Your work will show up here.</p>
            <ButtonLink href="/dashboard/humanize" variant="primary" size="sm" className="mt-4">
              Humanize your first draft
            </ButtonLink>
          </Card>
        )}

        {/* Lifetime — a strip, not a grid of stat cards. */}
        <div className="glass-panel grid grid-cols-2 divide-x divide-y divide-white/[0.06] rounded-2xl sm:grid-cols-4 sm:divide-y-0">
          <Stat label="Words Humanized" value={props.lifetime.wordsHumanized.toLocaleString()} />
          <Stat label="Documents" value={props.lifetime.documentsCreated.toLocaleString()} />
          <Stat label="Study Sessions" value={props.lifetime.studySessions.toLocaleString()} />
          <Stat label="Time Saved (est.)" value={`${props.lifetime.timeSavedHoursEstimate} hrs`} />
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-subtle">Quick tasks</p>
          <div className="grid grid-cols-2 gap-2.5">
            <StudyModeLink mode="summarize" title="Summarize" description="Condense long material." />
            <StudyModeLink mode="explain" title="Explain" description="Break it down simply." />
            <StudyModeLink mode="notes" title="Study notes" description="Turn it into notes." />
            <TaskLink href="/dashboard/humanize" title="Humanize" description="Rewrite in your voice." />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <button type="button" onClick={() => props.onJump("voice")} className="focus-ring hover-lift text-left">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">My Voice</p>
              <Badge variant={props.voiceProfileReady ? "brand" : "neutral"}>{props.voiceProfileReady ? "Ready" : "Not set up"}</Badge>
            </div>
            <p className="mt-2 text-xs text-foreground-subtle line-clamp-2">
              {props.voiceSummary ?? "Teach HUMANORA how you write from a few real samples."}
            </p>
          </Card>
        </button>
        <button type="button" onClick={() => props.onJump("plan")} className="focus-ring hover-lift text-left">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Plan</p>
              <Badge variant={props.planIsFree ? "neutral" : "brand"}>{props.plan}</Badge>
            </div>
            <p className="mt-2 text-xs text-foreground-subtle">
              {props.usage ? `${props.usage.humanizeCount} / ${props.usage.humanizeLimit} humanizations this period` : "Complimentary plan"}
            </p>
          </Card>
        </button>
        <button type="button" onClick={() => props.onJump("projects")} className="focus-ring hover-lift text-left">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Projects</p>
              <Badge variant="neutral">{props.projects.length}</Badge>
            </div>
            <p className="mt-2 text-xs text-foreground-subtle">
              {props.projects.length === 0 ? "No projects yet." : `Most recent: ${props.projects[0].name}`}
            </p>
          </Card>
        </button>
      </div>
    </div>
  );
}

function HLogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="currentColor" className={className} aria-hidden="true">
      <rect x="30" y="65" width="35" height="105" rx="6" />
      <rect x="135" y="25" width="35" height="145" rx="6" />
      <polygon points="65,95 135,60 135,90 65,125" />
    </svg>
  );
}

function TaskLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="focus-ring hover-lift flex flex-col justify-center rounded-xl border border-border bg-surface p-3.5 transition-[border-color,box-shadow] hover:border-brand-purple/35 hover:shadow-glow-sm"
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-0.5 text-xs text-foreground-subtle">{description}</p>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5">
      <p className="text-xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-foreground-subtle">{label}</p>
    </div>
  );
}

// Radial ring positions for up to 8 trait chips around the center summary.
const RING = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
  return { x: Math.round(Math.cos(angle) * 44), y: Math.round(Math.sin(angle) * 40) };
});

function VoiceTab(props: {
  voiceProfileCount: number;
  voiceProfileReady: boolean;
  voiceSummary: string | null;
  voiceTraits: { label: string; value: string }[];
  voiceQuirks: string[];
}) {
  if (!props.voiceSummary) {
    return (
      <Card className="p-8 text-center">
        <p className="text-base font-semibold text-foreground">No voice profile yet.</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-foreground-muted">
          {props.voiceProfileCount === 0
            ? "Add a few real writing samples and HUMANORA will build a structured profile of how you write."
            : `${props.voiceProfileCount} profile${props.voiceProfileCount === 1 ? "" : "s"} started, not yet analyzed.`}
        </p>
        <ButtonLink href="/dashboard/voice" variant="primary" size="sm" className="mt-5">
          Build your voice profile
        </ButtonLink>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Real trait fingerprint — a ring around the profile summary,
          not a fabricated radar chart. Positions computed once above;
          purely visual, no motion budget spent scroll-scrubbing it. */}
      <div className="relative flex h-[300px] w-[300px] items-center justify-center sm:h-[340px] sm:w-[340px]">
        <div className="pearl-glass relative flex h-[190px] w-[190px] flex-col items-center justify-center rounded-full p-6 text-center shadow-glow-sm">
          <p className="text-sm leading-relaxed text-foreground-muted">{props.voiceSummary}</p>
        </div>
        {props.voiceTraits.slice(0, 8).map((t, i) => (
          <div
            key={t.label}
            className="absolute rounded-full border border-brand-pink/25 bg-brand-pink/[0.08] px-2.5 py-1 text-[11px] capitalize text-foreground-muted"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${RING[i].x}px), calc(-50% + ${RING[i].y}px))`,
            }}
          >
            {t.label}: {t.value}
          </div>
        ))}
      </div>

      {props.voiceQuirks.length > 0 && (
        <div className="mt-8 flex max-w-lg flex-wrap justify-center gap-2">
          {props.voiceQuirks.map((q) => (
            <span key={q} className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-foreground-subtle">
              {q}
            </span>
          ))}
        </div>
      )}

      <p className="mt-6 max-w-md text-center text-xs text-foreground-subtle">
        This describes writing style only — never used to verify identity. Every trait can be reviewed and
        corrected.
      </p>
      <ButtonLink href="/dashboard/voice" variant="secondary" size="sm" className="mt-4">
        Manage voice profiles
      </ButtonLink>
    </div>
  );
}

function WritingTab(props: { modeUsage: ModeUsage[]; scans: ScanSummary[]; recentWork: RecentWorkItem[] }) {
  const maxCount = Math.max(1, ...props.modeUsage.map((m) => m.count));
  const humanized = props.recentWork.filter((w) => w.kind === "humanized").slice(0, 5);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card className="p-6">
        <p className="mb-4 text-sm font-medium text-foreground">Mode usage</p>
        {props.modeUsage.length === 0 ? (
          <p className="text-sm text-foreground-subtle">No Humanize runs yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {props.modeUsage.map((m) => (
              <div key={m.mode} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-xs capitalize text-foreground-subtle">{m.mode}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="bg-brand-gradient h-full rounded-full" style={{ width: `${(m.count / maxCount) * 100}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right text-xs text-foreground-subtle">{m.count}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <p className="mb-4 text-sm font-medium text-foreground">Recent AI Detector scans</p>
        {props.scans.length === 0 ? (
          <p className="text-sm text-foreground-subtle">No scans yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {props.scans.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span className="capitalize text-foreground-muted">{s.likelihood.replace(/-/g, " ")}</span>
                <span className="text-xs text-foreground-subtle">
                  {s.wordCount} words · {formatDate(s.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-6 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Recent Humanize output</p>
          <Link href="/dashboard/history" className="text-xs text-foreground-muted underline underline-offset-2 hover:text-foreground">
            View Library
          </Link>
        </div>
        {humanized.length === 0 ? (
          <p className="text-sm text-foreground-subtle">Nothing yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {humanized.map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-2.5">
                <p className="min-w-0 truncate text-sm text-foreground">{deriveTitle(h.inputText)}</p>
                <span className="shrink-0 text-xs text-foreground-subtle">{formatDateTime(h.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ProjectsTab({ projects }: { projects: ProjectSummary[] }) {
  if (projects.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-base font-semibold text-foreground">No projects yet.</p>
        <p className="mt-2 text-sm text-foreground-muted">Group related Humanize and Study work together.</p>
        <ButtonLink href="/dashboard/projects" variant="primary" size="sm" className="mt-5">
          Create a project
        </ButtonLink>
      </Card>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="focus-ring hover-lift block">
          <Card className="flex h-full flex-col p-5">
            <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
            <p className="mt-1 line-clamp-2 flex-1 text-xs text-foreground-subtle">{p.description ?? "No description."}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-foreground-subtle">
              <span>
                {p.itemCount} item{p.itemCount === 1 ? "" : "s"}
              </span>
              <span>Updated {formatDate(p.updatedAt)}</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function ActivityTab({ recentWork }: { recentWork: RecentWorkItem[] }) {
  if (recentWork.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-foreground-muted">Nothing yet — your activity will build up here.</p>
      </Card>
    );
  }
  return (
    <Card className="p-6">
      <ul className="flex flex-col gap-5">
        {recentWork.map((item, i) => (
          <li key={`${item.kind}-${item.id}`} className="relative flex gap-4 pl-0.5">
            {i < recentWork.length - 1 && (
              <span aria-hidden="true" className="absolute left-[5px] top-4 h-[calc(100%+0.75rem)] w-px bg-white/[0.08]" />
            )}
            <span
              aria-hidden="true"
              className={cn("mt-1.5 h-[10px] w-[10px] shrink-0 rounded-full", item.kind === "humanized" ? "bg-brand-gradient shadow-glow-sm" : "bg-brand-cyan")}
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
  );
}

function PlanTab(props: {
  plan: string;
  planIsFree: boolean;
  freeTrialUsed: boolean;
  currentPeriodEnd: string | null;
  usage: UsageSummary | null;
}) {
  return (
    <Card className="mx-auto max-w-lg p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Current plan</p>
        <Badge variant={props.planIsFree ? "neutral" : "brand"}>{props.plan}</Badge>
      </div>
      {props.planIsFree ? (
        <p className="mt-2 text-sm text-foreground-muted">
          {props.freeTrialUsed ? "Your one complimentary humanization has been used." : "You have one complimentary humanization available."}
        </p>
      ) : (
        props.usage && (
          <>
            <p className="mt-2 text-sm text-foreground-muted">
              {props.usage.humanizeCount} / {props.usage.humanizeLimit} humanizations · {props.usage.wordsProcessed.toLocaleString()} words
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full border border-border">
              <div className="bg-brand-gradient h-full rounded-full" style={{ width: `${Math.min(100, (props.usage.humanizeCount / props.usage.humanizeLimit) * 100)}%` }} />
            </div>
            {props.currentPeriodEnd && (
              <p className="mt-2 text-xs text-foreground-subtle">Access through {formatDate(props.currentPeriodEnd)}</p>
            )}
          </>
        )
      )}
      <div className="mt-5">
        <ButtonLink href="/dashboard/billing" variant="secondary" size="sm">
          {props.planIsFree ? "View plans" : "Manage billing"}
        </ButtonLink>
      </div>
    </Card>
  );
}

function AccountTab(props: { name: string; providers: string[] }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      <Card className="p-6">
        <p className="text-sm font-medium text-foreground">Signed in with</p>
        <p className="mt-1 text-sm text-foreground-muted">
          {props.providers.map((p) => PROVIDER_LABEL[p] ?? p).join(" & ") || "Email & password"}
        </p>
      </Card>
      <ProfileForm initialName={props.name} />
      <DangerZone />
    </div>
  );
}
