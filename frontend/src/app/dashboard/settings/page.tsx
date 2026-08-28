import { redirect } from "next/navigation";
import Image from "next/image";
import { getVerifiedSession } from "@/lib/auth-session";
import { Container } from "@/components/ui/Container";
import { AccountSettings } from "@/components/dashboard/AccountSettings";
import { getLinkedProviders } from "@/lib/db/account";
import { getUsageSummary } from "@/lib/db/usage";
import { getSubscriptionSummary, getFreeTrialStatus } from "@/lib/db/entitlement";
import { getVoiceOverview } from "@/lib/db/voice";
import { PLANS } from "@/lib/config/plans";

export const metadata = { title: "Account — HUMANORA" };

export default async function SettingsPage() {
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") redirect("/login");
  const { user } = result.session;

  const [providers, billing, voice, freeTrial] = await Promise.all([
    getLinkedProviders(user.id),
    getSubscriptionSummary(user.id),
    getVoiceOverview(user.id),
    getFreeTrialStatus(user.id),
  ]);
  const usage =
    billing.effectivePlan !== "free" ? await getUsageSummary(user.id, billing.effectivePlan) : null;

  return (
    <Container className="mx-auto max-w-2xl">
      {/* Decorative only — the cards below (AccountSettings) are all
          opaque bg-surface, so the image only ever shows through the
          page gutters/header, never behind actual text. Fixed dark
          artwork regardless of the light/dark toggle, same call as
          AuthShell's always-dark auth background — a photographic scene
          has no sensible "light mode" variant. rounded-3xl + overflow-
          hidden keeps it contained to this page's own block instead of
          bleeding into the sidebar/header chrome. */}
      <div className="relative mb-8 overflow-hidden rounded-3xl">
        <Image
          src="/images/settings-background.png"
          alt=""
          fill
          priority={false}
          sizes="(min-width: 1024px) 672px, 100vw"
          className="object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70" aria-hidden="true" />
        <div className="relative px-6 py-8 sm:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">Account</h1>
          <p className="mt-1 text-sm text-white/80">
            Your HUMANORA account, plan, and preferences.
          </p>
        </div>
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
        voiceProfileCount={voice.profileCount}
        voiceProfileReady={voice.hasAnalyzedProfile}
      />
    </Container>
  );
}
