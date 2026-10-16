"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { signUp } from "@/lib/auth-client";

// Shared with LoginFormPanel — see there for why.
const AUTH_EMAIL_BRIDGE_KEY = "humanora-auth-email";

export function SignupFormPanel({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
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

    let signUpError: { message?: string } | null;
    try {
      ({ error: signUpError } = await signUp.email({ name, email, password }));
    } catch {
      // A network failure rejects rather than returning an error — without
      // this the button would spin forever.
      signUpError = { message: "Couldn't reach the server. Check your connection and try again." };
    }

    if (signUpError) {
      setError(signUpError.message ?? "Couldn't create your account. Please try again.");
      setLoading(false);
      return;
    }

    try {
      window.sessionStorage.removeItem(AUTH_EMAIL_BRIDGE_KEY);
    } catch {
      // ignore
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="auth-panel-frame w-full max-w-[440px]">
    <div className="login-glass-panel relative w-full overflow-hidden p-8">
      <h1 className="auth-heading text-[2rem] leading-tight text-foreground">Create your account</h1>
      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">Free — no credit card required.</p>

      {/* Signup carries more hesitation than login ("I'm deciding
          whether to start" vs. "get me in") — a little concrete
          reassurance up front. Real, existing behavior — not a
          marketing claim. */}
      <p className="mt-4 flex items-center gap-1.5 text-xs text-foreground-subtle">
        <CheckIcon className="h-3.5 w-3.5 shrink-0 text-success" />
        One complimentary humanization included, no card required
      </p>

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

      <form onSubmit={handleSubmit} className={`flex flex-col gap-5 ${googleEnabled ? "mt-4" : "mt-8"}`}>
        <div>
          <label htmlFor="name" className="auth-field-label mb-1.5 block">
            Name
          </label>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
            <Input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="login-field h-12 rounded-md pl-10"
            />
          </div>
        </div>
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
          <label htmlFor="password" className="auth-field-label mb-1.5 block">
            Password
          </label>
          <PasswordInput
            id="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
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
          Create account <span aria-hidden="true">→</span>
        </Button>
      </form>

      <p className="mt-8 text-center text-sm leading-relaxed text-foreground-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-purple underline underline-offset-4 transition-colors hover:text-foreground">
          Log in
        </Link>
      </p>

      <p className="mt-6 text-balance text-center text-xs leading-relaxed tracking-wide text-foreground-subtle">
        <LockIcon className="mr-1.5 inline-block h-3.5 w-3.5 align-[-0.2em] text-foreground-muted" />
        Secure sign-up — your writing is never shared or sold.
      </p>
    </div>
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 17c1-3.2 3.6-5 6.5-5s5.5 1.8 6.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
