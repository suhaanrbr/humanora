"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";

/**
 * Mirrors LoginFormPanel's request/response shape: `requestPasswordReset`
 * always resolves without revealing whether the email is registered
 * (better-auth's own anti-enumeration behavior), so the "sent" state
 * below is shown on success regardless of account existence.
 */
export function ForgotPasswordFormPanel() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: reqError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setLoading(false);
    if (reqError) {
      setError(reqError.message ?? "Something went wrong. Please try again.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="auth-panel-frame w-full max-w-[440px]">
      <div className="login-glass-panel relative w-full overflow-hidden p-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reset your password</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          {sent
            ? "Check your inbox for a link to reset your password."
            : "Enter the email on your account and we'll send you a link to reset it."}
        </p>

        {sent ? (
          <div className="mt-8 flex flex-col gap-5">
            <p
              role="status"
              className="flex items-start gap-2 rounded-xl border border-brand-purple/25 bg-brand-purple/[0.08] px-3.5 py-2.5 text-sm text-foreground"
            >
              <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple" />
              If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => setSent(false)}
              className="h-14 w-full rounded-full text-base font-semibold"
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="login-field h-[52px] rounded-full pl-10"
                />
              </div>
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
              Send reset link <span aria-hidden="true">→</span>
            </Button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-foreground-muted">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-brand-purple underline underline-offset-2 hover:text-brand-pink">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="m3.5 5.5 6.5 5 6.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
