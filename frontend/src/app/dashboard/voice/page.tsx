import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { getUserPlan } from "@/lib/db/entitlement";
import { listVoiceSamples, getOrCreateVoiceProfile } from "@/lib/db/voice";
import { voiceStyleProfileSchema } from "@/lib/ai/voiceAnalysis";
import { VoiceWorkspace } from "@/components/dashboard/VoiceWorkspace";

export const metadata = { title: "My Voice — HUMANORA" };

export default async function VoicePage() {
  const session = (await auth.api.getSession({ headers: await headers() }))!;
  const userId = session.user.id;

  const [plan, samples, profileRow] = await Promise.all([
    getUserPlan(userId),
    listVoiceSamples(userId),
    getOrCreateVoiceProfile(userId),
  ]);

  const initialProfile = profileRow.styleProfileJson
    ? voiceStyleProfileSchema.safeParse(JSON.parse(profileRow.styleProfileJson))
    : null;
  const overrides = profileRow.userOverridesJson ? JSON.parse(profileRow.userOverridesJson) : {};

  return (
    <Container className="mx-auto max-w-4xl">
      <VoiceWorkspace
        plan={plan}
        initialSamples={samples.map((s) => ({ id: s.id, content: s.content, wordCount: s.wordCount }))}
        initialProfile={initialProfile?.success ? initialProfile.data : null}
        initialOverrides={overrides}
      />
    </Container>
  );
}
