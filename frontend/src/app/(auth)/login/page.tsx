import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getVerifiedSession } from "@/lib/auth-session";
import { LoginFormPanel } from "@/components/auth/LoginFormPanel";

export const metadata = { title: "Log in — HUMANORA" };

/**
 * An already-authenticated user has no reason to see the login form —
 * sending them straight to the dashboard is standard commercial-SaaS
 * behavior. A session-lookup ERROR (transient DB hiccup) is treated as
 * "show the form" rather than redirected, same fail-open-to-the-form
 * reasoning as everywhere else that distinguishes the two (see
 * lib/auth-session.ts) — worst case here is just seeing a login form
 * you didn't need, not a security problem.
 */
export default async function LoginPage() {
  const result = await getVerifiedSession();
  if (result.status === "authenticated") {
    redirect("/dashboard");
  }
  return (
    <Suspense fallback={null}>
      <LoginFormPanel googleEnabled={!!process.env.GOOGLE_CLIENT_ID} />
    </Suspense>
  );
}
