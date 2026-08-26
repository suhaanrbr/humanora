import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { getUserPlan } from "@/lib/db/entitlement";
import { getOrCreateVoiceProfile } from "@/lib/db/voice";
import { HumanizeWorkspace } from "@/components/dashboard/HumanizeWorkspace";

export const metadata = { title: "Humanize — HUMANORA" };

export default async function HumanizePage() {
  // Request-memoized — reuses the layout's session lookup, no extra DB call.
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") {
    redirect("/login");
  }
  const userId = result.session.user.id;

  const [plan, voiceProfile] = await Promise.all([getUserPlan(userId), getOrCreateVoiceProfile(userId)]);

  return <HumanizeWorkspace plan={plan} hasVoiceProfile={!!voiceProfile.styleProfileJson} />;
}
