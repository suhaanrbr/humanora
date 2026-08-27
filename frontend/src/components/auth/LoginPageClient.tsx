"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { HumanoraRibbon } from "@/components/brand/HumanoraRibbon";
import { TransformationPreview } from "@/components/brand/TransformationPreview";
import { LoginCosmicScene } from "@/components/auth/LoginCosmicScene";
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
    <div className="login-glass-panel relative w-full max-w-sm overflow-hidden rounded-2xl p-8 sm:p-10">
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
      <div className="relative hidden overflow-hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-14 xl:p-16">
        <LoginCosmicScene className="absolute inset-0" />
        <Link href="/" className="focus-ring relative z-10 w-fit rounded-md">
          <Logo size="md" />
        </Link>

        <div className="relative z-10 flex max-w-md flex-col gap-6">
          <span className="login-badge inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground-muted">
            <SparkleIcon className="h-3.5 w-3.5 text-brand-purple" />
            AI-powered writing
          </span>
          <div>
            <p className="text-3xl font-bold tracking-tight text-foreground xl:text-4xl">
              Writing that
              <br />
              <span className="text-brand-gradient text-brand-gradient-glow">sounds like you.</span>
            </p>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-foreground-muted">
              HUMANORA turns stiff, AI-assisted drafts into natural writing —
              without losing your meaning, facts, or voice.
            </p>
          </div>
          <TransformationPreview className="w-64" />
          {/* The signature motif closes the composed moment — structured
              text resolving into human rhythm, right where the preview
              card just showed exactly that happen. A small deliberate
              flourish here, not the barely-visible background wash a
              generic auth template would use. */}
          <HumanoraRibbon className="h-8 w-40 opacity-60" animated />
        </div>

        <p className="relative z-10 text-xs text-foreground-subtle">
          &copy; {new Date().getFullYear()} HUMANORA
        </p>
      </div>

      {/* Right: the actual form, on its own quiet surface. */}
      <div className="bg-ambient-glow-soft relative flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
          <Link href="/" className="focus-ring w-fit rounded-md">
            <Logo size="sm" />
          </Link>
          {/* Mobile has no split-screen brand panel — this one line is
              the entire brand story on a 390px screen, so the form can
              dominate immediately below it. */}
          <p className="max-w-xs text-sm text-foreground-muted">
            Writing that sounds like you — without losing your meaning.
          </p>
        </div>
        <Suspense fallback={null}>
          <LoginForm googleEnabled={googleEnabled} />
        </Suspense>
      </div>
    </div>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
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
