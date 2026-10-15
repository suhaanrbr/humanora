"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

// Shared with SignupFormPanel — carries an in-progress email across a
// Login <-> Signup switch (a real convenience, not account data) so
// retyping isn't necessary. Never used for the password field.
const AUTH_EMAIL_BRIDGE_KEY = "humanora-auth-email";

/** Only ever redirect within Humanora itself — an open `next` param could
 * otherwise be used to bounce a just-authenticated user to an external
 * site (classic open-redirect). A single leading slash, never `//...`
 * (protocol-relative) or an absolute URL. */
function safeNextPath(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/dashboard";
}

export function LoginFormPanel({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect --
     Deliberate: restoring browser-only sessionStorage state can't
     happen during SSR or the initial client render without a
     hydration mismatch — same accepted pattern used throughout this
     codebase (e.g. HumanizeWorkspace's draft restore). */
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(AUTH_EMAIL_BRIDGE_KEY);
      if (saved) setEmail(saved);
    } catch {
      // sessionStorage can throw in some private-browsing contexts — not worth surfacing
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleEmailChange(value: string) {
    setEmail(value);
    try {
      if (value) window.sessionStorage.setItem(AUTH_EMAIL_BRIDGE_KEY, value);
      else window.sessionStorage.removeItem(AUTH_EMAIL_BRIDGE_KEY);
    } catch {
      // ignore — this is a nicety, not critical functionality
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await signIn.email({ email, password });

    if (signInError) {
      setError(signInError.message ?? "Couldn't log in. Check your email and password.");
      setLoading(false);
      return;
    }

    try {
      window.sessionStorage.removeItem(AUTH_EMAIL_BRIDGE_KEY);
    } catch {
      // ignore
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="auth-panel-frame w-full max-w-[440px]">
    <div className="login-glass-panel relative w-full overflow-hidden p-8">
      <h1 className="auth-heading text-[2rem] leading-tight text-foreground">Log in</h1>
      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">Welcome back to Humanora.</p>

      {googleEnabled && (
        <div className="mt-6 flex flex-col gap-4">
          <GoogleButton />
          <div className="flex items-center gap-3 text-xs text-foreground-subtle">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={cn("flex flex-col gap-5", googleEnabled ? "mt-4" : "mt-8")}>
        <div>
          <label htmlFor="email" className="auth-field-label mb-1.5 block">
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
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="you@example.com"
              className="login-field h-12 rounded-md pl-10"
            />
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="auth-field-label block">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-brand-purple underline underline-offset-2 hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="login-field h-12 rounded-md"
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
          className="login-cta mt-2 h-12 w-full rounded-md text-base font-semibold"
        >
          Log in <span aria-hidden="true">→</span>
        </Button>
      </form>

      <p className="mt-8 text-center text-sm leading-relaxed text-foreground-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-brand-purple underline underline-offset-4 transition-colors hover:text-foreground">
          Sign up free
        </Link>
      </p>

      <p className="mt-6 text-balance text-center text-xs leading-relaxed tracking-wide text-foreground-subtle">
        <LockIcon className="mr-1.5 inline-block h-3.5 w-3.5 align-[-0.2em] text-foreground-muted" />
        Secure sign-in — your writing is never shared or sold.
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

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M4 7h8a1.5 1.5 0 0 1 1.5 1.5v4.5A1.5 1.5 0 0 1 12 14.5H4A1.5 1.5 0 0 1 2.5 13V8.5A1.5 1.5 0 0 1 4 7Zm4 2.25a1 1 0 0 0-.55 1.84V12a.55.55 0 0 0 1.1 0v-.91A1 1 0 0 0 8 9.25Z"
      />
    </svg>
  );
}
