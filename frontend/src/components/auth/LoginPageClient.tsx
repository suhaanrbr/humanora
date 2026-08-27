"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { HumanoraRibbon } from "@/components/brand/HumanoraRibbon";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

/** Only ever redirect within HUMANORA itself — an open `next` param could
 * otherwise be used to bounce a just-authenticated user to an external
 * site (classic open-redirect). A single leading slash, never `//...`
 * (protocol-relative) or an absolute URL. */
function safeNextPath(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/dashboard";
}

function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    router.push(next);
    router.refresh();
  }

  return (
    <div className="pearl-glass w-full max-w-sm rounded-2xl p-8 sm:p-10">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Log in</h1>
      <p className="mt-2 text-sm text-foreground-muted">Welcome back to HUMANORA.</p>

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

      <form onSubmit={handleSubmit} className={cn("flex flex-col gap-4", googleEnabled ? "mt-4" : "mt-8")}>
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
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
          </div>
          <PasswordInput
            id="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" loading={loading} className="mt-2 w-full">
          Log in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-foreground-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-foreground underline underline-offset-2 hover:text-brand-purple">
          Sign up free
        </Link>
      </p>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-foreground-subtle">
        <LockIcon className="h-3 w-3" />
        Secure sign-in — your writing is never shared or sold.
      </div>
    </div>
  );
}

export function LoginPageClient({ googleEnabled }: { googleEnabled: boolean }) {
  return (
    <div className="relative flex min-h-screen">
      {/* Left: brand/aurora panel — desktop only. This is a focused,
          full-screen auth moment, deliberately without the marketing
          header/footer chrome, matching how premium products (not
          copied from any one of them) treat sign-in as its own space. */}
      <div className="bg-ambient-glow bg-grid-texture relative hidden overflow-hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="focus-ring relative z-10 w-fit rounded-md">
          <Logo size="md" />
        </Link>

        <div className="relative z-10 max-w-md">
          <p className="text-brand-gradient text-brand-gradient-glow text-3xl font-bold tracking-tight">
            Writing that sounds like you.
          </p>
          <p className="mt-4 text-base text-foreground-muted">
            HUMANORA turns stiff, AI-assisted drafts into natural writing —
            without losing your meaning, facts, or voice.
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

      {/* Right: the actual form, on its own quiet surface. */}
      <div className="bg-ambient-glow-soft relative flex flex-1 flex-col items-center justify-center px-6 py-16">
        <Link href="/" className="focus-ring absolute left-6 top-6 w-fit rounded-md lg:hidden">
          <Logo size="sm" />
        </Link>
        <Suspense fallback={null}>
          <LoginForm googleEnabled={googleEnabled} />
        </Suspense>
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
