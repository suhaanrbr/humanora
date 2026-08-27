import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { SignupPageClient } from "@/components/auth/SignupPageClient";

export const metadata = { title: "Sign up — HUMANORA" };

export default async function SignupPage() {
  const result = await getVerifiedSession();
  if (result.status === "authenticated") {
    redirect("/dashboard");
  }
  return <SignupPageClient />;
}
