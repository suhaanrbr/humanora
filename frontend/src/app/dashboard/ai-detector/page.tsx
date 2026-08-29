import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { getUserPlan } from "@/lib/db/entitlement";
import { getDetectorScansForUser } from "@/lib/db/detector";
import { DetectorWorkspace } from "@/components/dashboard/DetectorWorkspace";

export const metadata = { title: "AI Detector — HUMANORA" };

export default async function AiDetectorPage() {
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") redirect("/login");

  const userId = result.session.user.id;
  const plan = await getUserPlan(userId);
  const scans = plan === "free" ? [] : await getDetectorScansForUser(userId, 20);

  return (
    <DetectorWorkspace
      plan={plan}
      initialScans={scans.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() }))}
    />
  );
}
