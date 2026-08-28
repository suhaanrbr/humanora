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

    const { error: signUpError } = await signUp.email({ name, email, password });

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
    <div className="login-glass-panel relative w-full max-w-[440px] overflow-hidden rounded-[20px] p-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
      <p className="mt-2 text-sm text-foreground-muted">Free — no credit card required.</p>

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

      <form onSubmit={handleSubmit} className={`flex flex-col gap-4 ${googleEnabled ? "mt-4" : "mt-8"}`}>
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
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
              className="login-field h-[52px] rounded-xl pl-10"
            />
          </div>
        </div>
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
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="you@example.com"
              className="login-field h-[52px] rounded-xl pl-10"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
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
            className="login-field h-[52px] rounded-xl"
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
          className="login-cta mt-2 h-14 w-full rounded-xl text-base font-semibold"
        >
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-foreground-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-purple underline underline-offset-2 hover:text-brand-pink">
          Log in
        </Link>
      </p>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-foreground-subtle">
        <LockIcon className="h-3 w-3" />
        Secure sign-up — your writing is never shared or sold.
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
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
