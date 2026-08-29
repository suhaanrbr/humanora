"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { signOut } from "@/lib/auth-client";
import { formatDate, formatDateTime } from "@/lib/formatDate";
import { deriveTitle } from "@/lib/text";
import { StudyModeLink } from "@/components/dashboard/StudyModeLink";

interface UsageSummary {
  humanizeCount: number;
  humanizeLimit: number;
  wordsProcessed: number;
  periodEnd: Date;
}

interface RecentWorkItem {
  kind: "humanized" | "study";
  id: string;
  inputText: string;
  outputText: string;
  createdAt: string;
}

interface AccountSettingsProps {
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
  providers: string[];
  plan: string;
  planIsFree: boolean;
  freeTrialUsed: boolean;
  currentPeriodEnd: Date | null;
  usage: UsageSummary | null;
  voiceProfileCount: number;
  voiceProfileReady: boolean;
  voiceSummary: string | null;
  voiceTraits: { label: string; value: string }[];
  recentWork: RecentWorkItem[];
}

const PROVIDER_LABEL: Record<string, string> = {
  credential: "Email & password",
  google: "Google",
};

export function AccountSettings({
  name: initialName,
  email,
  image,
  createdAt,
  providers,
  plan,
  planIsFree,
  freeTrialUsed,
  currentPeriodEnd,
  usage,
  voiceProfileCount,
  voiceProfileReady,
  voiceSummary,
  voiceTraits,
  recentWork,
}: AccountSettingsProps) {
  const initial = initialName.trim()[0]?.toUpperCase() ?? "U";
  const mostRecent = recentWork[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      {/* Identity — who I am, my plan, at a glance. */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- external Google avatar URL, not worth Next/Image's optimization pipeline for a single small avatar
            <img src={image} alt="" className="h-14 w-14 shrink-0 rounded-full border border-border" referrerPolicy="no-referrer" />
          ) : (
            <div className="bg-brand-gradient flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-base font-semibold text-foreground">{initialName}</p>
              <Badge variant={planIsFree ? "neutral" : "brand"}>{plan}</Badge>
            </div>
            <p className="truncate text-sm text-foreground-muted">{email}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4 text-xs text-foreground-subtle">
          <span>Member since {formatDate(createdAt)}</span>
          <span>·</span>
          <span>
            Signed in with {providers.map((p) => PROVIDER_LABEL[p] ?? p).join(" & ") || "email & password"}
          </span>
        </div>
      </Card>

      {/* Continue — real most recent work, not a fabricated "pick up
          where you left off" for a brand new account. */}
      {mostRecent && (
        <Link
          href={mostRecent.kind === "study" ? "/dashboard/study" : "/dashboard/history"}
          className="glass-panel hover-lift group flex flex-col justify-between rounded-2xl p-5"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">Continue</p>
          <p className="mt-2 text-sm font-semibold text-foreground group-hover:text-brand-purple">
            {deriveTitle(mostRecent.inputText)}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-foreground-subtle">{mostRecent.outputText}</p>
          <p className="mt-4 text-xs text-foreground-subtle">
            {mostRecent.kind === "humanized" ? "Humanized" : "Studied"} {formatDateTime(mostRecent.createdAt)}
          </p>
        </Link>
      )}

      {/* Quick tasks — every card here executes a real, specific action.
          Study's three shortcuts route through StudyModeLink so they
          actually land in the correct tab (see StudyModeLink.tsx),
          the same fix applied to the Home dashboard's quick actions. */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">Quick tasks</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TaskLink href="/dashboard/humanize" title="Humanize a draft" description="Rewrite text to sound like you." />
          <StudyModeLink mode="summarize" title="Summarize" description="Condense long material fast." />
          <StudyModeLink mode="explain" title="Explain" description="Break a hard topic down simply." />
          <StudyModeLink mode="notes" title="Study notes" description="Turn material into revision notes." />
          <TaskLink href="/dashboard/voice" title="My Voice" description="View or build your voice profile." />
          <TaskLink href="/dashboard/history" title="Library" description="Everything you've created." />
        </div>
      </div>

      {/* My Voice — the product's real differentiator, surfaced with the
          same Gemini-derived, Zod-validated traits already used to
          steer humanize() calls — never fabricated categories. */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">My Voice</p>
          <Badge variant={voiceProfileReady ? "brand" : "neutral"}>
            {voiceProfileReady ? "Profile ready" : "Not set up"}
          </Badge>
        </div>
        {voiceSummary ? (
          <>
            <p className="mt-2 text-sm text-foreground-muted">{voiceSummary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {voiceTraits.map((t) => (
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
          <p className="mt-2 text-sm text-foreground-muted">
            {voiceProfileCount === 0
              ? "Teach HUMANORA how you write from a few real samples."
              : `${voiceProfileCount} Voice profile${voiceProfileCount === 1 ? "" : "s"}, not yet analyzed.`}
          </p>
        )}
        <div className="mt-4">
          <ButtonLink href="/dashboard/voice" variant="secondary" size="sm">
            {voiceProfileCount === 0 ? "Get started" : "Open"}
          </ButtonLink>
        </div>
      </Card>

      {/* Plan summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Plan</p>
          <Badge variant={planIsFree ? "neutral" : "brand"}>{plan}</Badge>
        </div>
        {planIsFree ? (
          <p className="mt-2 text-sm text-foreground-muted">
            {freeTrialUsed
              ? "Your one complimentary humanization has been used."
              : "You have one complimentary humanization available."}
          </p>
        ) : (
          usage && (
            <p className="mt-2 text-sm text-foreground-muted">
              {usage.humanizeCount} / {usage.humanizeLimit} humanizations used
              {currentPeriodEnd && ` · access through ${formatDate(currentPeriodEnd)}`}
            </p>
          )
        )}
        <div className="mt-4 flex gap-2">
          <ButtonLink href="/dashboard/billing" variant="secondary" size="sm">
            {planIsFree ? "View plans" : "Manage billing"}
          </ButtonLink>
        </div>
      </Card>

      <ProfileForm initialName={initialName} />
      <DangerZone />

      <p className="text-center text-xs text-foreground-subtle">
        Need something else?{" "}
        <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">
          Contact us
        </Link>
      </p>
    </div>
  );
}

function TaskLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="focus-ring hover-lift group flex flex-col justify-center rounded-xl border border-border bg-surface p-4.5 transition-[border-color,box-shadow] hover:border-brand-purple/35 hover:shadow-glow-sm"
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-foreground-subtle">{description}</p>
    </Link>
  );
}

export function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function saveName() {
    if (!name.trim() || name === initialName) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Couldn't update your name.");
        return;
      }
      setSaved(true);
    } catch {
      setError("Couldn't reach HUMANORA. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-6">
      <p className="mb-4 text-sm font-medium text-foreground">Profile</p>
      <label className="mb-1.5 block text-xs text-foreground-subtle">Name</label>
      <input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setSaved(false);
        }}
        maxLength={80}
        className="focus-ring w-full rounded-md border border-border bg-background-elevated px-3.5 py-2.5 text-sm text-foreground"
      />
      {error && <p className="mt-3 text-xs text-danger">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={saveName} loading={saving} disabled={!name.trim() || name === initialName}>
          Save changes
        </Button>
        {saved && <span className="text-xs text-success">Saved</span>}
      </div>
    </Card>
  );
}

export function DangerZone() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (confirmText !== "DELETE") return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Couldn't delete your account. Please try again.");
        setDeleting(false);
        return;
      }
      await signOut();
      router.push("/");
      router.refresh();
    } catch {
      setError("Couldn't reach HUMANORA. Check your connection and try again.");
      setDeleting(false);
    }
  }

  return (
    <Card className="border-danger/30 bg-danger/5 p-6">
      <p className="text-sm font-medium text-foreground">Delete account</p>
      <p className="mt-1 text-xs text-foreground-muted">
        This permanently deletes your account, history, My Voice samples, and billing records. This
        cannot be undone.
      </p>

      {!confirming ? (
        <Button variant="destructive" size="sm" className="mt-4" onClick={() => setConfirming(true)}>
          Delete my account
        </Button>
      ) : (
        <div className="mt-4">
          <label className="mb-1.5 block text-xs text-foreground-subtle">
            Type <span className="font-mono font-semibold">DELETE</span> to confirm
          </label>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="focus-ring w-full max-w-xs rounded-md border border-danger/40 bg-background-elevated px-3.5 py-2.5 text-sm text-foreground"
          />
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
          <div className="mt-3 flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              loading={deleting}
              disabled={confirmText !== "DELETE"}
            >
              Permanently delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setConfirming(false); setConfirmText(""); setError(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
