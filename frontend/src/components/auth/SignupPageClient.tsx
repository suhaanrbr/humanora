"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { HumanoraRibbon } from "@/components/brand/HumanoraRibbon";
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

        <div className="relative z-10 max-w-md">
          <p className="text-brand-gradient text-brand-gradient-glow text-3xl font-bold tracking-tight">
            Free to start. No card required.
          </p>
          <p className="mt-4 text-base text-foreground-muted">
            Create an account to save your history, build a My Voice
            profile, and track your usage as HUMANORA grows.
          </p>
        </div>

        <HumanoraRibbon
          className="pointer-events-none absolute inset-x-0 bottom-16 h-24 w-full opacity-[0.12]"
          animated
        />
        <p className="relative z-10 text-xs text-foreground-subtle">
          &copy; {new Date().getFullYear()} HUMANORA
        </p>
      </div>

      <div className="bg-ambient-glow-soft relative flex flex-1 flex-col items-center justify-center px-6 py-16">
        <Link href="/" className="focus-ring absolute left-6 top-6 w-fit rounded-md lg:hidden">
          <Logo size="sm" />
        </Link>

        <div className="pearl-glass w-full max-w-sm rounded-2xl p-8 sm:p-10">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
          <p className="mt-2 text-sm text-foreground-muted">Free — no credit card required.</p>

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
        </div>
      </div>
    </div>
  );
}
