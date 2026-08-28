import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { getUserPlan } from "@/lib/db/entitlement";
import { getUsageSummary } from "@/lib/db/usage";
import { getLifetimeStats } from "@/lib/db/stats";

export const metadata = { title: "Analytics — HUMANORA" };

/**
 * Real numbers only, from getLifetimeStats/getUsageSummary — no chart
 * library added for this first pass (no time-bucketed history table
 * exists yet to chart a trend over), just the lifetime totals and this
 * month's plan usage, laid out as stat cards. A real trend chart is
 * Phase 7 in the dashboard-redesign plan once usage is stored per-day
 * rather than only per-month.
 */
export default async function AnalyticsPage() {
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") redirect("/login");
  const userId = result.session.user.id;

  const plan = await getUserPlan(userId);
  const [lifetime, usage] = await Promise.all([getLifetimeStats(userId), getUsageSummary(userId, plan)]);

  return (
    <Container className="mx-auto max-w-2xl">
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
