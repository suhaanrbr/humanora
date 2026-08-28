"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";

/** The token better-auth appends to the `redirectTo` URL passed to
 * `forgetPassword` (see ForgotPasswordFormPanel) — required to prove
 * this request came from the emailed link rather than a guess. */
export function ResetPasswordFormPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (!token) {
      setError("This reset link is invalid or has expired. Please request a new one.");
      return;
    }
    setLoading(true);
    setError("");

    const { error: resetError } = await authClient.resetPassword({ newPassword: password, token });

    setLoading(false);
    if (resetError) {
      setError(resetError.message ?? "This reset link is invalid or has expired. Please request a new one.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <div className="auth-panel-frame w-full max-w-[440px]">
      <div className="login-glass-panel relative w-full overflow-hidden p-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Set a new password</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          {done ? "Your password has been reset. Redirecting you to log in…" : "Choose a new password for your account."}
        </p>

        {!done && (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                New password
              </label>
              <PasswordInput
                id="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="login-field h-[52px] rounded-full"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-foreground">
                Confirm password
              </label>
              <PasswordInput
                id="confirm"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="login-field h-[52px] rounded-full"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-danger/25 bg-danger/[0.08] px-3.5 py-2.5 text-sm text-danger"
              >
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="login-cta mt-2 h-14 w-full rounded-full text-base font-semibold"
            >
              Reset password <span aria-hidden="true">→</span>
            </Button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-foreground-muted">
          <Link href="/login" className="font-medium text-brand-purple underline underline-offset-2 hover:text-brand-pink">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 6.5v4M10 13.2v.05" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
