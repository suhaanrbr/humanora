import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { getUserPlan } from "@/lib/db/entitlement";
import { getVoiceOverview } from "@/lib/db/voice";
import { HumanizeWorkspace } from "@/components/dashboard/HumanizeWorkspace";

export const metadata = { title: "Humanize — HUMANORA" };

export default async function HumanizePage() {
  // Request-memoized — reuses the layout's session lookup, no extra DB call.
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") {
    redirect("/login");
  }
  const userId = result.session.user.id;

  const [plan, voice] = await Promise.all([getUserPlan(userId), getVoiceOverview(userId)]);

  return (
    <HumanizeWorkspace
      plan={plan}
      voiceProfiles={voice.profiles.filter((p) => p.ready).map((p) => ({ id: p.id, name: p.name, isDefault: p.isDefault }))}
    />
  );
}
