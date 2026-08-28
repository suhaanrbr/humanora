import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { SignupFormPanel } from "@/components/auth/SignupFormPanel";

export const metadata = { title: "Sign up — HUMANORA" };

export default async function SignupPage() {
  const result = await getVerifiedSession();
  if (result.status === "authenticated") {
    redirect("/dashboard");
  }
  return <SignupFormPanel googleEnabled={!!process.env.GOOGLE_CLIENT_ID} />;
}
