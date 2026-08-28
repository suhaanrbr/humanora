import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { LoginArtworkLayer } from "@/components/auth/LoginArtworkLayer";
import { AuthPanelTransition } from "@/components/auth/AuthPanelTransition";
import type { ReactNode } from "react";

/**
 * The persistent HUMANORA authentication environment — artwork, logo,
 * badge, headline, and copy, shared by BOTH /login and /signup via
 * app/(auth)/layout.tsx. This is what makes switching between the two
 * routes feel like one floating interface changing state rather than
 * two separate pages: Next.js keeps a shared layout mounted across
 * navigation between routes that render it, so this entire shell
 * (including the artwork's own network request) never remounts or
 * reloads when a visitor moves between "Log in" and "Sign up free" —
 * only `children` (the glass panel itself) changes.
 *
 * The headline stays "Writing that sounds like you." on both routes,
 * deliberately — the environment doesn't re-pitch itself depending on
 * which form is showing.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#02030b]">
      {/* Phones (<md): the real artwork stays gated off for perf (see
          LoginArtworkLayer), but a flat #02030b behind a translucent
          glass panel read as a dead black rectangle with nothing for
          the panel to pick up. A few soft, static radial gradients
          evoke the same violet/blue cosmic palette at zero image cost,
          so the glass has something to glow against. Hidden at md+
          where the real artwork takes over. */}
      <div className="pointer-events-none absolute inset-0 md:hidden" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 60% at 50% -10%, rgba(99,102,241,0.35) 0%, transparent 60%)," +
              "radial-gradient(90% 50% at 100% 100%, rgba(139,92,246,0.28) 0%, transparent 60%)," +
              "radial-gradient(80% 45% at 0% 85%, rgba(217,70,239,0.16) 0%, transparent 60%)",
          }}
        />
      </div>
      <LoginArtworkLayer className="absolute inset-0 hidden md:block" />

      <div className="relative z-10 w-full">
        {/* >= lg: side-by-side layout — copy column on the left, panel on the right. */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_440px] lg:gap-16 lg:p-16 xl:p-20">
          <div className="flex flex-col justify-between">
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
            </div>

            <p className="text-xs text-foreground-subtle">&copy; {new Date().getFullYear()} HUMANORA</p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <AuthPanelTransition>{children}</AuthPanelTransition>
          </div>
        </div>

        {/* < lg: one stacked, centered column — logo, badge + headline
            (tablet/md gets the real artwork behind it; phones/<md get a
            plain dark background and a shorter one-line strap instead,
            per LoginArtworkLayer's own perf gate), then the panel. */}
        <div className="flex flex-col items-center gap-8 px-5 py-10 text-center sm:gap-10 sm:px-8 sm:py-14 lg:hidden">
          <div className="flex flex-col items-center gap-5 sm:gap-6">
            <Link href="/" className="focus-ring w-fit rounded-md">
              <Logo size="sm" />
            </Link>

            <span className="login-badge hidden w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground-muted md:inline-flex">
              <SparkleIcon className="h-3.5 w-3.5 text-brand-purple" />
              AI-powered writing
            </span>

            <p className="hidden max-w-sm text-3xl font-bold leading-[1.15] tracking-[-0.01em] text-foreground sm:text-4xl md:block">
              Writing that{" "}
              <span className="text-brand-gradient text-brand-gradient-glow">sounds like you.</span>
            </p>

            <p className="max-w-xs text-sm text-foreground-muted md:hidden">
              Writing that sounds like you — without losing your meaning.
            </p>
          </div>

          <AuthPanelTransition>{children}</AuthPanelTransition>
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
