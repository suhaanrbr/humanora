import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { ForgotPasswordFormPanel } from "@/components/auth/ForgotPasswordFormPanel";

export const metadata = { title: "Reset password — HUMANORA" };

/**
 * Same reasoning as /login (see page.tsx there): an already-authenticated
 * visitor has no reason to reset a password, so send them to the
 * dashboard; a session-lookup error fails open to showing the form.
 */
export default async function ForgotPasswordPage() {
  const result = await getVerifiedSession();
  if (result.status === "authenticated") {
    redirect("/dashboard");
  }
  return <ForgotPasswordFormPanel />;
}
