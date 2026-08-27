"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { HumanoraRibbon } from "@/components/brand/HumanoraRibbon";
import { TransformationPreview } from "@/components/brand/TransformationPreview";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { signUp } from "@/lib/auth-client";

export function SignupPageClient({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen">
      {/* Same split-screen treatment as /login, for visual consistency
          across the auth flow. */}
      <div className="bg-ambient-glow bg-grid-texture relative hidden overflow-hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="focus-ring relative z-10 w-fit rounded-md">
          <Logo size="md" />
        </Link>

        <div className="relative z-10 flex max-w-md flex-col gap-6">
          <div>
            <p className="text-brand-gradient text-brand-gradient-glow text-3xl font-bold tracking-tight">
              Free to start. No card required.
            </p>
            <p className="mt-4 text-base text-foreground-muted">
              Create an account to save your history, build a My Voice
              profile, and track your usage as HUMANORA grows.
            </p>
          </div>
          <TransformationPreview className="w-64" />
          <HumanoraRibbon className="h-8 w-40 opacity-60" animated />
        </div>

        <p className="relative z-10 text-xs text-foreground-subtle">
          &copy; {new Date().getFullYear()} HUMANORA
        </p>
      </div>

      <div className="bg-ambient-glow-soft relative flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
          <Link href="/" className="focus-ring w-fit rounded-md">
            <Logo size="sm" />
          </Link>
          <p className="max-w-xs text-sm text-foreground-muted">
            Free to start — no card required, ready in under a minute.
          </p>
        </div>

        <div className="pearl-glass w-full max-w-sm rounded-2xl p-8 sm:p-10">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
          <p className="mt-2 text-sm text-foreground-muted">Free — no credit card required.</p>

          {/* Signup carries more hesitation than login ("I'm deciding
              whether to start" vs. "get me in") — a little concrete
              reassurance up front, without turning this into a second
              landing page. */}
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
              <Input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
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
              />
            </div>

            {error && (
              <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading} className="mt-2 w-full">
              Create account
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-foreground-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline underline-offset-2 hover:text-brand-purple">
              Log in
            </Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-foreground-subtle">
            <LockIcon className="h-3 w-3" />
            Secure sign-up — your writing is never shared or sold.
          </div>
        </div>
      </div>
    </div>
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
