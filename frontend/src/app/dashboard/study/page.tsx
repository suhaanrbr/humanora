import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { getUserPlan } from "@/lib/db/entitlement";
import { StudyWorkspace, StudyUpsell } from "@/components/dashboard/StudyWorkspace";
import { Container } from "@/components/ui/Container";

export const metadata = { title: "Study — HUMANORA" };

export default async function StudyPage() {
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") redirect("/login");
  const plan = await getUserPlan(result.session.user.id);

  if (plan === "free") {
    return (
      <Container>
        <StudyUpsell />
      </Container>
    );
  }

  return <StudyWorkspace plan={plan} />;
}
