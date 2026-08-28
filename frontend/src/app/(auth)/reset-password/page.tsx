import { Suspense } from "react";
import { ResetPasswordFormPanel } from "@/components/auth/ResetPasswordFormPanel";

export const metadata = { title: "Set a new password — HUMANORA" };

/**
 * Reached via the link in the password-reset email (see
 * auth.ts's sendResetPassword and ForgotPasswordFormPanel's
 * redirectTo). Unlike /login and /forgot-password, no
 * already-authenticated redirect here — resetting still needs to work
 * for a signed-in browser that requested it for a different reason.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordFormPanel />
    </Suspense>
  );
}
