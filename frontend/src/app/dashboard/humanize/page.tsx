import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserPlan } from "@/lib/db/entitlement";
import { getOrCreateVoiceProfile } from "@/lib/db/voice";
import { HumanizeWorkspace } from "@/components/dashboard/HumanizeWorkspace";

export const metadata = { title: "Humanize — HUMANORA" };

export default async function HumanizePage() {
  const session = (await auth.api.getSession({ headers: await headers() }))!;
  const userId = session.user.id;

  const [plan, voiceProfile] = await Promise.all([getUserPlan(userId), getOrCreateVoiceProfile(userId)]);

  return <HumanizeWorkspace plan={plan} hasVoiceProfile={!!voiceProfile.styleProfileJson} />;
}
