import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { Container } from "@/components/ui/Container";
import { getUserPlan } from "@/lib/db/entitlement";
import { listVoiceProfiles, listVoiceSamples } from "@/lib/db/voice";
import { voiceStyleProfileSchema } from "@/lib/ai/voiceAnalysis";
import { VoiceWorkspace, type ProfileData } from "@/components/dashboard/VoiceWorkspace";
import { PLANS } from "@/lib/config/plans";

export const metadata = { title: "My Voice — HUMANORA" };

export default async function VoicePage() {
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") redirect("/login");
  const userId = result.session.user.id;

  const [plan, profiles] = await Promise.all([getUserPlan(userId), listVoiceProfiles(userId)]);

  const profileData: ProfileData[] = await Promise.all(
    profiles.map(async (p) => {
      const samples = await listVoiceSamples(p.id);
      const parsedProfile = p.styleProfileJson
        ? voiceStyleProfileSchema.safeParse(JSON.parse(p.styleProfileJson))
        : null;
      return {
        id: p.id,
        name: p.name,
        isDefault: p.isDefault,
        samples: samples.map((s) => ({ id: s.id, content: s.content, wordCount: s.wordCount })),
        profile: parsedProfile?.success ? parsedProfile.data : null,
        overrides: p.userOverridesJson ? JSON.parse(p.userOverridesJson) : {},
      };
    })
  );

  return (
    <Container className="mx-auto max-w-4xl">
      <VoiceWorkspace plan={plan} maxProfiles={PLANS[plan].maxVoiceProfiles} initialProfiles={profileData} />
    </Container>
  );
}
