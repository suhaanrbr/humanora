"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
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
    <div className="login-glass-panel relative w-full max-w-[440px] overflow-hidden rounded-[20px] p-8">
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
              className="login-field h-[52px] rounded-xl pl-10"
            />
          </div>
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
          Log in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-foreground-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-brand-purple underline underline-offset-2 hover:text-brand-pink">
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#02030b]">
      {/* One continuous, full-bleed backdrop — logo, copy, product
          preview, and the login card all sit on top of the SAME
          cosmic scene, not two visually separate halves. The login
          card floats on the right, exactly as in the reference —
          no outer frame/border, the whole viewport is the canvas. */}
      <LoginCosmicScene className="absolute inset-0 hidden lg:block" />

      <div className="relative z-10 w-full">
        <div className="grid grid-cols-1 gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_440px] lg:gap-16 lg:p-16 xl:p-20">
          {/* Left: brand story — hidden below lg, matching the
              reference's desktop-only landscape; mobile gets its own
              compact header instead (see below). */}
          <div className="hidden flex-col justify-between lg:flex">
            <Link href="/" className="focus-ring w-fit rounded-md">
              <Logo size="md" />
            </Link>

            <div className="flex max-w-md flex-col gap-6">
              <span className="login-badge inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground-muted">
                <SparkleIcon className="h-3.5 w-3.5 text-brand-purple" />
                AI-powered writing
              </span>
              <div>
                <p className="text-4xl font-bold leading-[1.05] tracking-[-0.01em] text-foreground xl:text-5xl">
                  Writing that
                  <br />
                  <span className="text-brand-gradient text-brand-gradient-glow">sounds like you.</span>
                </p>
                <p className="mt-4 max-w-sm text-base leading-relaxed text-foreground-muted">
                  HUMANORA turns stiff, AI-assisted drafts into natural writing —
                  without losing your meaning, facts, or voice.
                </p>
              </div>
              <TransformationPreview className="login-preview-glass w-64" />
            </div>

            <p className="text-xs text-foreground-subtle">&copy; {new Date().getFullYear()} HUMANORA</p>
          </div>

          {/* Right: the actual form. */}
          <div className="flex flex-col items-center justify-center lg:items-end">
            <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
              <Link href="/" className="focus-ring w-fit rounded-md">
                <Logo size="sm" />
              </Link>
              <p className="max-w-xs text-sm text-foreground-muted">
                Writing that sounds like you — without losing your meaning.
              </p>
            </div>
            <Suspense fallback={null}>
              <LoginForm googleEnabled={googleEnabled} />
            </Suspense>
          </div>
        </div>
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
