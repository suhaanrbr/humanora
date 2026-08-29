import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { getLinkedProviders } from "@/lib/db/account";
import { getUsageSummary } from "@/lib/db/usage";
import { getSubscriptionSummary, getFreeTrialStatus } from "@/lib/db/entitlement";
import { getVoiceOverview, getVoiceSnapshot } from "@/lib/db/voice";
import { getRecentWork } from "@/lib/db/recentWork";
import { getLifetimeStats, getHumanizeModeDistribution } from "@/lib/db/stats";
import { getDetectorScansForUser } from "@/lib/db/detector";
import { listProjectsForUser } from "@/lib/db/projects";
import { PLANS } from "@/lib/config/plans";
import { ProfileWorkspace } from "@/components/dashboard/ProfileWorkspace";

export const metadata = { title: "Profile — HUMANORA" };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") redirect("/login");
  const { user } = result.session;
  const { tab } = await searchParams;

  const [providers, billing, voice, freeTrial, voiceSnapshot, recentWork, lifetime, modeUsage, scans, projects] =
    await Promise.all([
      getLinkedProviders(user.id),
      getSubscriptionSummary(user.id),
      getVoiceOverview(user.id),
      getFreeTrialStatus(user.id),
      getVoiceSnapshot(user.id, { full: true }),
      getRecentWork(user.id, 8),
      getLifetimeStats(user.id),
      getHumanizeModeDistribution(user.id),
      getDetectorScansForUser(user.id, 5),
      listProjectsForUser(user.id),
    ]);
  const usage = billing.effectivePlan !== "free" ? await getUsageSummary(user.id, billing.effectivePlan) : null;

  return (
    <ProfileWorkspace
      initialTab={tab}
      name={user.name}
      email={user.email}
      image={user.image ?? null}
      createdAt={user.createdAt.toISOString()}
      providers={providers}
      plan={PLANS[billing.effectivePlan].name}
      planIsFree={billing.effectivePlan === "free"}
      freeTrialUsed={freeTrial.used}
      currentPeriodEnd={billing.currentPeriodEnd ? billing.currentPeriodEnd.toISOString() : null}
      usage={usage}
      voiceProfileCount={voice.profileCount}
      voiceProfileReady={voice.hasAnalyzedProfile}
      voiceSummary={voiceSnapshot.summary}
      voiceTraits={voiceSnapshot.traits}
      voiceQuirks={voiceSnapshot.quirks}
      recentWork={recentWork}
      lifetime={lifetime}
      modeUsage={modeUsage}
      scans={scans.map((s) => ({ id: s.id, wordCount: s.wordCount, likelihood: s.likelihood, createdAt: s.createdAt.toISOString() }))}
      projects={projects.map((p) => ({ ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() }))}
    />
  );
}
