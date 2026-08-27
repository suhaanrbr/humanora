import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { Container } from "@/components/ui/Container";
import { AccountSettings } from "@/components/dashboard/AccountSettings";
import { getLinkedProviders } from "@/lib/db/account";
import { getUsageSummary } from "@/lib/db/usage";
import { getSubscriptionSummary, getFreeTrialStatus } from "@/lib/db/entitlement";
import { getOrCreateVoiceProfile } from "@/lib/db/voice";
import { PLANS } from "@/lib/config/plans";

export const metadata = { title: "Account — HUMANORA" };

export default async function SettingsPage() {
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") redirect("/login");
  const { user } = result.session;

  const [providers, billing, voice, freeTrial] = await Promise.all([
    getLinkedProviders(user.id),
    getSubscriptionSummary(user.id),
    getOrCreateVoiceProfile(user.id),
    getFreeTrialStatus(user.id),
  ]);
  const usage =
    billing.effectivePlan !== "free" ? await getUsageSummary(user.id, billing.effectivePlan) : null;

  return (
    <Container className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Account</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Your HUMANORA account, plan, and preferences.
        </p>
      </div>
      <AccountSettings
        name={user.name}
        email={user.email}
        image={user.image ?? null}
        createdAt={user.createdAt}
        providers={providers}
        plan={PLANS[billing.effectivePlan].name}
        planIsFree={billing.effectivePlan === "free"}
        freeTrialUsed={freeTrial.used}
        currentPeriodEnd={billing.currentPeriodEnd}
        usage={usage}
        voiceSampleCount={voice.sampleCount}
        voiceProfileReady={!!voice.styleProfileJson}
      />
    </Container>
  );
}
