import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { getUserPlan } from "@/lib/db/entitlement";
import { getUsageSummary } from "@/lib/db/usage";
import { getLifetimeStats, getDailyActivity, getHumanizeModeDistribution } from "@/lib/db/stats";
import { ActivityChart } from "@/components/dashboard/ActivityChart";

export const metadata = { title: "Analytics — HUMANORA" };

/**
 * Every number here is derived directly from stored rows — lifetime
 * totals, this month's plan usage (both already real, Phase 1), plus a
 * genuine 14-day activity chart and mode-usage breakdown (both new).
 * No chart library (inline SVG — see ActivityChart.tsx), no fabricated
 * productivity scores/streaks. A metric with no honest source (a real
 * trend BEFORE 14 days of history, session-level engagement, etc.)
 * simply isn't here rather than being approximated.
 */
export default async function AnalyticsPage() {
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") redirect("/login");
  const userId = result.session.user.id;

  const plan = await getUserPlan(userId);
  const [lifetime, usage, daily, modes] = await Promise.all([
    getLifetimeStats(userId),
    getUsageSummary(userId, plan),
    getDailyActivity(userId, 14),
    getHumanizeModeDistribution(userId),
  ]);

  const hasAnyActivity = lifetime.documentsCreated > 0;

  return (
    <Container className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-foreground-muted">Your lifetime activity and this month&apos;s usage.</p>
      </div>

      <div className="glass-panel grid grid-cols-2 divide-x divide-y divide-white/[0.06] rounded-2xl">
        <StatCard label="Words humanized" value={lifetime.wordsHumanized.toLocaleString()} />
        <StatCard label="Documents created" value={lifetime.documentsCreated.toLocaleString()} />
        <StatCard label="Study sessions" value={lifetime.studySessions.toLocaleString()} />
        <StatCard label="Time saved (est.)" value={`${lifetime.timeSavedHoursEstimate} hrs`} />
      </div>

      {hasAnyActivity ? (
        <Card className="glass-panel mt-6 p-5">
          <p className="text-sm font-medium text-foreground">Last 14 days</p>
          <div className="mt-4">
            <ActivityChart data={daily} />
          </div>
        </Card>
      ) : (
        <Card className="mt-6 p-8 text-center">
          <p className="text-sm text-foreground-muted">
            Your activity chart will appear here once you&apos;ve humanized a draft or run a study
            session.
          </p>
        </Card>
      )}

      {modes.length > 0 && (
        <Card className="mt-6 p-5">
          <p className="text-sm font-medium text-foreground">Humanize mode usage</p>
          <div className="mt-4 flex flex-col gap-3">
            {modes.map((m) => {
              const max = modes[0].count;
              return (
                <div key={m.mode} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 truncate text-xs capitalize text-foreground-subtle">{m.mode}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-hover">
                    <div
                      className="bg-brand-gradient h-full rounded-full"
                      style={{ width: `${Math.max(4, (m.count / max) * 100)}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs text-foreground-subtle">{m.count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="glass-panel mt-6 p-5">
        <p className="text-sm font-medium text-foreground">This month</p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full border border-border">
          <div
            className="bg-brand-gradient h-full rounded-full"
            style={{ width: `${Math.min(100, (usage.humanizeCount / usage.humanizeLimit) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-foreground-subtle">
          {usage.humanizeCount} / {usage.humanizeLimit} humanizations · {usage.wordsProcessed.toLocaleString()} /{" "}
          {usage.wordsLimit.toLocaleString()} words
        </p>
      </Card>
    </Container>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5">
      <p className="text-xs text-foreground-subtle">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
    </div>
  );
}
