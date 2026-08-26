import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { Container } from "@/components/ui/Container";
import { getUserPlan } from "@/lib/db/entitlement";
import { listVoiceSamples, getOrCreateVoiceProfile } from "@/lib/db/voice";
import { voiceStyleProfileSchema } from "@/lib/ai/voiceAnalysis";
import { VoiceWorkspace } from "@/components/dashboard/VoiceWorkspace";

export const metadata = { title: "My Voice — HUMANORA" };

export default async function VoicePage() {
  // Request-memoized — reuses the layout's session lookup, no extra DB call.
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") {
    redirect("/login");
  }
  const userId = result.session.user.id;

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
